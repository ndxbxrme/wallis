const {API} = require('aws-amplify');
const {menu, options} = require('./menu.js');
const {diff} = require('deep-diff');
module.exports = async (app, auth) => {
  let drawings = [];
  let filters = [];
  let pageSize = 4;
  const paging = {page:0,totalTotal:0,filteredTotal:0,noPages:0,pageSize};
  const sorting = {selector:'number',dir:'-1'};
  const sortOptions = [
    {name:'Code',selector:'number'},
    {name:'Create date',selector:'createDate'},
    {name:'User',selector:'user'},
    {name:'Total terminations',selector:'total.terminations'},
    {name:'Total sections',selector:'total.sections'}
  ];
  const start = async () => {
    filters = [];
    drawings = await API.get('WallisAPI', '/drawings');
    menu.total = [
      {name:'Total terminations',selector:'terminations',min:0,max:500,default:'1'},
      {name:'Total sections',selector:'sections',min:0,max:500,default:'1'},
      {name:'Total columns',selector:'columns',min:0,max:500,default:'1'}
    ];
    menu.meta = [
      {name:'User',selector:'user'},
      {name:'Updated by',selector:'updatedBy'},
      {name:'Code',selector:'number',min:0,max:50000,default:'600'},
    ];
    options.user = drawings.reduce((res, drawing) => res.includes(drawing.user) ? res : [...res, drawing.user], []).sort();
    options.updatedBy = drawings.reduce((res, drawing) => res.includes(drawing.updatedBy) ? res : [...res, drawing.updatedBy], []).sort();
    options.copperBarSize = drawings.reduce((res, drawing) => res.includes(drawing.base.copperBarSize) ? res : [...res, drawing.base.copperBarSize], []).sort((a,b) => {
      const [wa,ha] = a.split(/[^\d]/g);
      const [wb,hb] = b.split(/[^\d]/g); 
      if(+wa===+wb) return +ha > +hb ? 1 : -1;
      return +wa > +wb ? 1 : -1;
    });
    console.log('options', drawings);
    renderFilters();
    updateFilters();
    //renderDrawings();
  };
  const getDrawing = async (id) => {
    if(!drawings.length) drawings = await API.get('WallisAPI', '/drawings');
    return drawings.find(drawing => drawing.id===id);
  }
  const del = async (id) => {
    if(confirm('Are you sure?')) {
      await API.del('WallisAPI', '/drawing', {body:{id}});
      await start();
    }
  }
  const pdf = async (id, type) => {
    const drawing = await getDrawing(id);
    await app.editor.renderPdf(drawing, type);
  }
  const clone = async (id) => {
    const drawing = await getDrawing(id);
    const cloneDrawing = JSON.parse(JSON.stringify(drawing));
    ['user', 'createDate', 'updateDate', 'updatedBy'].forEach(thing => (delete cloneDrawing[thing]));
    cloneDrawing.id = Math.floor(Math.random() * 999999999999).toString(36);
    cloneDrawing.revisions = [];
    delete cloneDrawing.version;
    drawings.push(cloneDrawing);
    app.goto('editor/' + cloneDrawing.id);
  }
  const renderDrawings = () => {
    const filtered = drawings.filter(drawing => {
      drawing.total = {
        terminations: 0,
        columns: 0,
        sections: drawing.bars.length
      }
      drawing.bars.forEach(bar => bar.columns.forEach(column => {
        drawing.total.columns++;
        drawing.total.terminations += +column.repeatCount * +column.norows;
      }))
      
      let truth = true;
      filters.forEach(filter => {
        if(filter.options || filter.max) {
          let value = filter.value;
          if(filter.max) value = +value;
          const operator = filter.operator || '==';
          const evalStr = 'a ' + operator + ' b';
          if(filter.key==='base') {
            truth = truth && app.evalInContext(evalStr, {a:drawing.base[filter.selector],b:value});
          }
          else if(filter.key==='total') {
            truth = truth && app.evalInContext(evalStr, {a:drawing.total[filter.selector],b:value});
          }
          else if(filter.key==='meta') {
            truth = truth && app.evalInContext(evalStr, {a:drawing[filter.selector],b:value});
          }
          else if(filter.key==='column') {
            truth = truth && drawing.bars.reduce((res, bar) => res || bar.columns.reduce((res, column) => res || (app.evalInContext(evalStr, {a:column[filter.selector],b:value})), false), false);
          }
          else if(filter.key==='row') {
            truth = truth && drawing.bars.reduce((res, bar) => res || bar.columns.reduce((res, column) => res || column.rows.reduce((res, row) => res || (app.evalInContext(evalStr, {a:row[filter.selector],b:value})), false), false), false)
          }
        }
      })
      return truth;
    })
    paging.totalTotal = drawings.length;
    paging.filteredTotal = filtered.length;
    paging.noPages = Math.ceil(paging.filteredTotal / paging.pageSize);
    if(paging.page > paging.noPages) paging.page = paging.noPages;
    filtered.sort((a,b) => a.version > b.version ? -(+sorting.dir) : +sorting.dir);
    filtered.sort((a,b) => app.evalInContext(`a.${sorting.selector} > b.${sorting.selector} ? ${sorting.dir} : ${-sorting.dir}`,{a,b}));
    const html = app.fillTemplate(app.$('#dashboard-drawings').innerText, {drawings:filtered.filter((drawing, i) => {
      return (i >= paging.page * paging.pageSize) && (i < (paging.page + 1) * paging.pageSize )
    }),paging,sorting,sortOptions});
    app.$('.dashboard-drawings').innerHTML = html;
  }
  const renderFilters = (id) => {
    const data = {
      filterNames: Object.keys(menu).reduce((res, key) => {
          const item = menu[key];
          return [...res, ...item.map(thing => thing.name)];
        }, []).sort((a,b) => a > b ? 1 : -1).filter(name => !filters.map(f => f.name).includes(name)),
      filters
    }
    let html = app.fillTemplate(app.$('#dashboard-filter').innerText, data);
    app.$('.filters').innerHTML = html;
  }
  const addFilter = (_name) => {
    const name = _name || app.$('#filter-select').value;
    const menuItem = Object.keys(menu).reduce((res, key) => {
      const item = menu[key];
      return [...res, ...item.map(thing => {thing.key = key; return thing})];
    }, []).find(item => item.name === name);
    menuItem.options = options[menuItem.selector];
    filters.push(menuItem);
    renderFilters();
    updateFilters();
    console.log(filters);
  }
  const removeFilter = (name) => {
    const filter = filters.find(filter => filter.name===name);
    delete filter.value;
    delete filter.operator;
    filters = filters.filter(filter => filter.name!==name);
    renderFilters();
    updateFilters();
  }
  const updateFilters = () => {
    filters.forEach(filter => {
      filter.value = app.$(`select[name="${filter.selector}"], input[name="${filter.selector}"]`).value;
      filter.operator = (app.$(`select[name="${filter.selector}_operator"]`) || {}).value;
    });
    //renderFilters();
    paging.page = 0;
    if(app.$('select#sort-selector')) {
      sorting.selector = app.$('select#sort-selector').value;
      sorting.dir = app.$('select#sort-direction').value;
      paging.pageSize = +app.$('#page-size').value;
    }
    renderDrawings();
  }
  const resetDir = () => {
    app.$('select#sort-direction').value = '1';
  }
  const setPage = (page) => {
    paging.page = Math.min(paging.noPages, Math.max(0, page));
    renderDrawings();
  }
  const findDuplicates = async (drawing) => {
    if(!drawings.length) drawings = await API.get('WallisAPI', '/drawings');
    return drawings.filter(_drawing => {
      const differences = diff({base:drawing.base,bars:drawing.bars},{base:_drawing.base,bars:_drawing.bars});
      return !differences && (_drawing.id!==drawing.id);
    });
  }
  const getNextDrawingNo = () => Math.max(...drawings.map(drawing => drawing.number || '599')) + 1;
  const getNextDrawingVersion = (number) => Math.max(...drawings.filter(drawing => drawing.number === number).map(drawing => drawing.version || 0)) + 1;
  return {start, getDrawing, delete:del, pdf, clone, addFilter, removeFilter, updateFilters,getNextDrawingNo,getNextDrawingVersion,setPage,resetDir,findDuplicates}
}