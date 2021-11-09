console.clear()
window.pFetch = (() => {
  const fetchCSV = async (name) => {
    const res = await fetch(name);
    const text = await res.text();
    return text.split(/\n/g).map(line => line.split(/\s*,\s*/g));
  }
  const fetchData = async () => {
    const csv1 = await fetchCSV(require('../vw_ANWTestFittings.csv').default);
    const csv2 = await fetchCSV(require('../vw_ANWTestFittings1.csv').default);
    const csv3 = await fetchCSV(require('../Copper.csv').default);
    const things = csv1.reduce((res, line) => {
      res[line[0]] = res[line[0]] || {};
      res[line[0]][line[1]] = res[line[0]][line[1]] || {};
      res[line[0]][line[1]][line[2]] = res[line[0]][line[1]][line[2]] || [];
      res[line[0]][line[1]][line[2]].push({code:line[3],description:line[4],price:line[5].trim()});
      return res
    },{});
    csv2.reduce((res, line) => {
      res[line[0]] = res[line[0]] || {};
      res[line[0]][line[1]] = res[line[0]][line[1]] || {};
      res[line[0]][line[1]][line[2]] = res[line[0]][line[1]][line[2]] || [];
      res[line[0]][line[1]][line[2]].push({code:line[3],description:line[4],price:line[5].trim()});
      return res
    }, things)
    csv3.reduce((res, line) => {
      res[line[0]] = res[line[0]] || {};
      res[line[0]][line[1]] = res[line[0]][line[1]] || {};
      res[line[0]][line[1]][line[2]] = res[line[0]][line[1]][line[2]] || [];
      res[line[0]][line[1]][line[2]].push({code:line[3],description:line[4],price:line[5].trim()});
      return res
    }, things)
  }
  return {
    fetchData
  }
})();
window.pFetch.fetchData()
const EBRenderer = require('../renderer.js');
const {API} = require('aws-amplify');
const {barSizes} = require('./barSizes.js');
const {menu,options} = require('./menu.js');
const Modal = require('./modal.js');
const pricesJson = require('./prices.json');
const dictionary = require('./dictionary.json');
module.exports = async (tippy, auth) => {
  const pad = (n,i) => (i = Math.max(i,n.toString().length)) && (new Array(i).fill(0).join('') + n).substr(-i,i);
  const workingElm = document.querySelector('.working');
  let canRenderThumbnails = true;
  const blankSelection = {
    base: {},
    bars: [{columns:[]}]
  };
  let selection = JSON.parse(JSON.stringify(blankSelection));
  let pattern = {
    width: 400,
    height: 400,
    offset: {x:0,y:0},
    materials: [{
      name: 'bar',
      color: [0.1, 0.1, 0.65],
      metalness: 0.95,
      roughness: 0.8
    }],
    objects: [{
      model: 'barside',
      material: 'bar',
      position: [0, 0, 0]
    },{
      model: 'barside',
      material: 'bar',
      position: [0, 0, 0],
      scale: [1, -1, 1]
    },{
      model: 'barend',
      material: 'bar',
      position: [0, 0, 0]
    },{
      model: 'barend',
      material: 'bar',
      position: [0, 0, 0],
      scale: [-1, 1, 1]
    },{
      model: 'barfill',
      material: 'bar',
      position: [-5, 0, 0],
      scale: [-6.6, 4, 1]
    },{
      model: 'barfill',
      material: 'bar',
      position: [32.5, -10, 0],
      scale: [1, 2, 1]
    },{
      model: 'barhole',
      material: 'bar',
      position: [32.5, 15, 0],
      scale: [1, 1, 1],
      morph: [0.8]
    },{
      model: 'barhole',
      material: 'bar',
      position: [32.5, 5, 0],
      scale: [1, 1, 1],
      morph: [0.3]
    }],
    labels: [],
    decals: [{
      position: [0,0,3],
      material: 'bar'
    }]
  };
  //const csv = document.querySelector('script[type="text/csv"]').innerText;
  const dimensions = require('./dimensions.js');
  Object.keys(dimensions).forEach(key => dimensions[key].sort((a,b) => +a > +b ? 1 : -1));
  const ebRenderer = EBRenderer(undefined, undefined, pattern, 'assets/');
  const render = () => {
    ebRenderer.update(pattern);
  };
  const getMaterial = (name, materialName) => {
    switch(name) {
      case 'Black PVC':
      case 'Black PVC (full length)':
        return {name:materialName,color:[0.6, 0.1, 0.2],metalness:0.6,roughness:0.8};
      case 'Hard drawn plain copper':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'ACHAN1 galvanised mild steel (full length)':
      case 'ACHAN1 galvanised mild steel':
        return {name:materialName,color:[0.5,0.05,0.71],metalness:0.8,roughness:0.3};
      case 'AVG galvanised steel (full length)':
      case 'AVG galvanised steel':
        return {name:materialName,color:[0.53,0.08,0.53],metalness:0.8,roughness:0.3};
      case 'Aluminium':
        return {name:materialName,color:[0.555,0.03,0.80],metalness:0.9,roughness:0.2};
      case 'Black PVC (full length)':
      case 'Black PVC':
        return {name:materialName,color:[0.6, 0.1, 0.2],metalness:0.6,roughness:0.8};
      case 'Brass (non-compliant)':
        return {name:materialName,color:[0.11,0.96,0.61],metalness:0.8,roughness:0.3};
			case 'Brass zinc plated':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Bright zinc plated (full length)':
      case 'Bright zinc plated':
        return {name:materialName,color:[0.54,0.11,0.76],metalness:1,roughness:0};
      case 'Copper nickel plated':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Hard drawn tinned copper':
        return {name:materialName,color:[0.83,0.18,0.83],metalness:0.8,roughness:0.3};
      case 'Hard drawn plain copper':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Hot dipped galvanised (full length)':
      case 'Hot dipped galvanised':
        return {name:materialName,color:[0.53,0.32,0.84],metalness:0.8,roughness:0.3};
      case 'Nickel plated phosphor bronze (non-compliant)':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Phosphor bronze':
        return {name:materialName,color:[0.063,0.95,0.75],metalness:1,roughness:0.1};
      case 'Stainless steel SS316 (full length)':
      case 'Stainless steel SS316':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Stainless steel A2 grade 304 (non-compliant)':
      case 'Stainless steel A4 grade 316(non-compliant)':
      case 'Stainless steel':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Silver plated hard drawn copper':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Black reinforced polyester':
        return {name:materialName,color:[0.6, 0.1, 0.2],metalness:0.6,roughness:0.8};
      case 'LSF':
        return {name:materialName,color:[0.6, 0.1, 0.2],metalness:0.6,roughness:0.8};
        
    }
    return {name:materialName,color:[0,1,1],metalness:.5,roughness:.5}
  }
  const renderSection = (section, opts, values) => {
    return section.map(menuItem => {
      const myMenuItem = JSON.parse(JSON.stringify(menuItem));
      if(values.fittingType && values.fittingType==='Hole' && myMenuItem.selector==='terminationsSize') {
        myMenuItem.selectorName = 'terminationsSize';
        myMenuItem.selector = 'holesSize';
        myMenuItem.name = 'Holes size';
      }
      let html = `<label>${myMenuItem.name}</label>`;
      const ttid = Math.floor(Math.random() * 999999999).toString(36);
      if(myMenuItem.tooltip) {
        html += `<span id='id${ttid}' class='tt'>?</span>`;
        setTimeout(() => tippy('#id' + ttid, {content:myMenuItem.tooltip,allowHTML:true}));
      }
      else {
        html += '<span></span>';
      }
      if(myMenuItem.min || myMenuItem.max) {
        html += `<input type="number" name="${myMenuItem.selector}" value="${values[myMenuItem.selector] || myMenuItem.default}" min="${myMenuItem.min || 0}" max="${myMenuItem.max || 10}" onchange="${myMenuItem.onchange || 'app.editor.update() || app.editor.render()'}" />`;
      }
      else if(myMenuItem.selector==='copperBarSize') {
        const barSize = values['copperBarSize'] || '50x6mm';
        const [w,h] = barSize.split(/[^\d]/g);
        const dimWHtml = Object.keys(dimensions).map(key => `<option value="${key}"${w===key?' selected':''}>${key}</option>`).join('');
        const dimHHtml = dimensions[w].map(hval => `<option value="${hval}"${h===hval?' selected':''}>${hval}</option>`).join('')
        html += `<div class="copperBarSize"><select name="w" onchange="${myMenuItem.onchange || 'app.editor.update() || app.editor.renderMenu() || app.editor.update() || app.editor.render()'}">${dimWHtml}</select><span>x</span><select name="h" onchange="${myMenuItem.onchange || 'app.editor.update() || app.editor.render()'}">${dimHHtml}</select><span>mm</span></div>`;
      }
      else {
        const selectorName = myMenuItem.selectorName || myMenuItem.selector;
        html += `<select name='${selectorName}' onchange="${myMenuItem.onchange || 'app.editor.update() || app.editor.render()'}">`;
        html += (opts[myMenuItem.selector] || []).map(option => `<option class="${myMenuItem.default===option?'default':''}" ${(values[selectorName]===option)||(!values[selectorName] && myMenuItem.default===option)?'selected':''}>${option}</option>`).join('');
        html += '</select>';
      }
      return html;
    }).join('');
  };
  const renderRows = (column) => {
    let r = 0;
    let html = '<div class="rows">';
    while(r++<(+column.norows || 1)) {
      let row = column.rows[r-1] || {};
      let section = row.fittingType==='Link'?menu.rowlink:menu.row;
      html += `<div class="row"><h3>Row ${r}</h3>`;
      html += '<form class="rowform">' + renderSection(section, options, row) + '</form>';
      html += '</div>';
    }
    html += '</div>';
    return html;
  };
  const renderMenu = () => {
    if(!selection.base.number) selection.base.number = selection.number;
    let baseHtml = renderSection(menu.base, options, selection.base);
    document.querySelector('#menu .base form').innerHTML = baseHtml;
    const feetMaterialElem = document.querySelector('#menu .base select[name="feetMaterial"]');
    feetMaterialElem.disabled = selection.base.baseMaterial!=='Feet';
    let clickboxCount = 0;
    let barsHtml = '<div class="bars">' + selection.bars.map((bar, l) => {
      let c = 1;
      let columnsHtml = bar.columns.map((column, i) => {
        let html = `<div class="column" onmouseover="app.editor.highlightColumn(${l},${i})">`;
        html += `<h3><span class="colsq" style="background:hsl(${((clickboxCount++)/10)*360},80%,50%)">&nbsp;</span>Column${+column.repeatCount>1&&'s'||''} ${c}${+column.repeatCount>1&&' - ' + (c+(+column.repeatCount - 1)) || ''}</h3>`;
        c += +column.repeatCount;
        html += '<form class="colform">' + renderSection(menu.column, options, column) + '</form>';
        html += renderRows(column);
        html += `<input type="button" onclick="app.editor.deleteColumn(${l},${i})" value="Remove Column" />`;
        html += '</div>';
        return html;
      }).join('');
      columnsHtml += `<input type="button" onclick="app.editor.addColumn(${l})" value="Add column" />`;
      //if(l<selection.bars.length - 1)
      //  columnsHtml += `<div class="link"><h2>Link ${l + 1}</h2><form class="linkForm">${renderSection(menu.rowlink, options, bar)}</form></div>`;
      let barHtml = `<div class="bar"><h2>Bar section ${l + 1}</h2>` + columnsHtml + `<input type="button" class="deleteBar" onclick="app.editor.deleteBar(${l})" value="Remove Bar Section" /></div>`;
      return barHtml;
    }).join('') + '</div>';
    barsHtml += '<div class="addBar"><input type="button" onclick="app.editor.addBar()" value="Add bar section" /></div>';
    document.querySelector('#menu .bars').innerHTML = barsHtml;
    //update();
  };
  const rerenderRows = () => {
    const columnElem = event.target.parentNode.parentNode;
    const barElem = columnElem.parentNode;
    const colIndex = Array.from(barElem.children).indexOf(columnElem) - 1;
    const barIndex = Array.from(barElem.parentNode.children).indexOf(barElem);
    const column = selection.bars[barIndex].columns[colIndex];
    columnElem.querySelector('.rows').innerHTML =  renderRows(column);
  }
  const rerenderColumnHeadings = () => {
    document.querySelectorAll('#menu .bar').forEach((barElem, l) => {
      let c = 1;
      barElem.querySelectorAll('.column').forEach((columnElem, i) => {
        const heading = columnElem.querySelector('h3');
        const column = selection.bars[l].columns[i];
        heading.innerHTML = `Column${+column.repeatCount>1&&'s'||''} ${c}${+column.repeatCount>1&&' - ' + (c+(+column.repeatCount - 1)) || ''}`;
        c += +column.repeatCount;
      });
    })
    
  };
  const checkForDuplicates = async () => {   
    if(window.app) {
      const duplicates = await app.dashboard.findDuplicates(selection);
      const duplicatesElm = app.$('.duplicates');
      duplicatesElm.innerHTML = duplicates.map(dupe => app.fillTemplate(app.$('#duplicate-item').innerText,dupe)).join('');
    }
  };
  const updateInfo = () => {
    const dateFormat = (date) => new Date(date).toISOString().split(/T/)[0].split('-').reverse().join('/');
    selection.total = {
      holes: 0,
      terminations: 0,
      columns: 0,
      sections: selection.bars.length,
      studs: []
    };
    selection.bars.forEach(bar => bar.columns.forEach(column => {
      selection.total.columns++;
      //selection.total.holes += +column.repeatCount * +column.norows;
      column.rows.forEach(row => {
        if(row.fittingType==='Termination') selection.total.terminations += +column.repeatCount;
        else if(row.fittingType==='Hole') selection.total.holes += + column.repeatCount;
        if(!selection.total.studs.includes(row.terminationsSize)) selection.total.studs.push(row.terminationsSize);
      });
    }))
    selection.total.studs.sort();
    let html = '';
    if(selection.number) html += `<h2>ANW-EBC-${selection.number}${selection.version>1?'-' + (selection.version-1) : ''}</h2>`;
    if(selection.number) html += `<h3>EBC${selection.number}${selection.version>1?'-' + (selection.version-1) : ''}</h3>`;
    html += `<p>${selection.base.copperBarSize.replace('x', ' x ').replace('mm','')} x ${selection.width}</p>`;
    if(selection.total.studs.length) html += `<p>${selection.total.studs.join(' & ')}`;
    if(selection.total.terminations) html += ` x ${selection.total.terminations} ${selection.base.terminationMaterial.replace(' (non-compliant)', '')} Hex Head Set</p>`;
    html += `<p>Created ${dateFormat(selection.createDate || new Date().toString())} by ${selection.user || auth.user ? auth.user.username : ''}</p>`;
    if(selection.updateDate) html += `<p>Updated ${dateFormat(selection.updateDate)} by ${selection.updatedBy}`;
    /*time to make*/
    const formatTime = (i) => {let pad = (n) => ('0' + n).substr(-2,2); let h = Math.floor(i / 3600000); let m = Math.floor((i - h * 3600000) / 60000); let s = Math.floor((i - h * 3600000 - m * 60000) / 1000); return h + 'h:' + pad(m) + 'm' /*+ ':' + pad(s)*/}
    const noElements = selection.total.terminations + selection.total.holes + selection.noInsulators;
    const noEnds = selection.total.sections * 2;
    const noLinks = selection.noLinks;
    const noBaseEnds = (selection.base.baseMaterial==='Feet'?selection.noInsulators:1) * 2;
    const noBaseHoles = selection.noInsulators * 2;
    selection.manufacturingTime = {
      elements: noElements * 2 * 60 * 1000 * +selection.base.quantity,
      ends: noEnds * 2 * 60 * 1000 * +selection.base.quantity,
      links: noLinks * 2 * 60 * 1000 * +selection.base.quantity,
      baseEnds: noBaseEnds * 1 * 60 * 1000 * +selection.base.quantity,
      baseHoles: noBaseHoles * 1 * 60 * 1000 * +selection.base.quantity,
      buffing: selection.total.sections * 1 * 60 * 1000 * +selection.base.quantity
    }
    selection.manufacturingTime.total = Object.values(selection.manufacturingTime).reduce((res, time) => res += time, 0);
    html += `<h5>Time breakdown</h5>`;
    html += `<p>Elements - ${formatTime(selection.manufacturingTime.elements)}</p>`;
    html += `<p>Ends - ${formatTime(selection.manufacturingTime.ends)}</p>`;
    html += `<p>Links - ${formatTime(selection.manufacturingTime.links)}</p>`;
    html += `<p>Base ends - ${formatTime(selection.manufacturingTime.baseEnds)}</p>`;
    html += `<p>Base holes - ${formatTime(selection.manufacturingTime.baseHoles)}</p>`;
    html += `<p>Buffing - ${formatTime(selection.manufacturingTime.buffing)}</p>`;
    html += `<h4>Total - ${formatTime(selection.manufacturingTime.total)}</h4>`;
    document.querySelector('.info').innerHTML = html;
  };
  const update = (ignoreMenu) => {
    if(!ignoreMenu) {
      selection.base = Array.from(document.querySelectorAll('#menu .base select, #menu .base input')).reduce((res, elm) => {
        res[elm.name] = elm.value;
        return res;
      }, {});
      selection.base.copperBarSize = `${selection.base.w}x${selection.base.h}mm`;
      selection.bars = Array.from(document.querySelectorAll('#menu .bar')).map((barelm, l) => {
        return {
          columns:Array.from(barelm.querySelectorAll('.column')).map((columnelm, f) => {
            let form = columnelm.querySelector('.colform')
            let column = Array.from(form.querySelectorAll('select, input')).reduce((res, elm) => {
              res[elm.name] = elm.value;
              return res;
            }, {});
            column.rows = Array.from(columnelm.querySelectorAll('.rowform')).map((form, f) => {
              return Array.from(form.querySelectorAll('select, input')).reduce((res, elm) => {
                res[elm.name] = elm.value;
                return res;
              }, {});
            })
            return column;
          }),
          linkType:null//(barelm.querySelector('.link select')||{value:null}).value
        };
      });
      //localStorage.setItem('eb', JSON.stringify(selection));
    }
    selection.noInsulators = 0;
    pattern.materials = ['base','feet','bar','insulator','termination'].map(name => getMaterial(selection.base[name + 'Material'],name));
    const linkMat = getMaterial(selection.base['barMaterial'], 'linkbar');
    linkMat.color[2] += 0.1;
    pattern.materials.push(linkMat);
    const barSize = selection.base.copperBarSize.match(/\d+/g).map(i => +i);
    const dScale = barSize[1] / 6;
    const dOffset = (barSize[1] - 6) / 2;
    pattern.objects = [];
    pattern.labels = [];
    pattern.decals = [];
    pattern.clickboxes = [];
    pattern.holes = [];
    pattern.scaffolding = [];
    pattern.barDimensions = [];
    if(!selection.bars.length) return;
    selection.base.baseProfile = selection.base.baseMaterial === 'Black PVC (full length)' ? 'Regular' : 'Top hat';
    const makeInsulator = (x, y, size, rowNo, totalRows, isLink, bar) => {
      const tSize = +size.replace(/M/g,'') / 10;
      console.log('TSIZE', tSize);
      const washerHeight = 1.8 * tSize;
      const nutHeight = 8 * tSize;
      const splitWasherHeight = 4.2 * tSize;
      selection.noInsulators++;
      pattern.objects.push({
        bar: bar,
        model: 'boltrod_m10',
        material: 'termination',
        position: [x, y, dOffset - dScale*3],
        scale: [1, 1, 1 + (barSize[1] > 6? barSize[1]/90:0 )]
      });
      pattern.objects.push({
        bar: bar,
        model: 'bolt_m10',
        material: 'termination',
        position: [x, y, selection.base.baseProfile==='Top hat'?-44:-50],
        scale: [1, 1, 1]
      });
      pattern.objects.push({
        bar: bar,
        model: 'washer_m10',
        material: 'termination',
        position: [x, y, dOffset + dScale * 3 + (isLink?dScale*6:0)],
        scale: [1, 1, tSize],
        rotation: [0,0,Math.random() * Math.PI * 2]
      });
      console.log('booo', washerHeight);
      pattern.objects.push({
        bar: bar,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, dOffset + washerHeight + dScale * 3 + (isLink?dScale*6:0)],
        scale: [1, 1, 1],
        rotation: [0,0,Math.random() * Math.PI * 2]
      });
      pattern.objects.push({
        bar: bar,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, -nutHeight + dOffset + dScale * 3],
        scale: [1, 1, 1],
        rotation: [0,0,Math.random() * Math.PI * 2]
      });
      pattern.objects.push({
        bar: bar,
        model: 'insulator',
        material: 'insulator',
        position: [x, y, -23]
      });
      pattern.labels.push({
        x: x,
        y: y,
        bar: bar,
        arc: true,
        start: [x, y, 0],
        end: [x, y + 15, 0],
        width: 2,
        dash: [8,2,2,2,2,2],
        text: 'Ins',
        textColor: 'white',
        textPos: [x, y - 23, 0]
      });
    };
    const makeTerminator = (x, y, size, rowNo, totalRows, bar) => {
      const r = Math.random() * Math.PI * 2;
      const tSize = +size.replace(/M/g,'') / 10;
      //console.log('TSIZE', tSize);
      const washerHeight = 1.8 * tSize;
      const nutHeight = 8 * tSize;
      const splitWasherHeight = 4.2 * tSize;
      pattern.objects.push({
        bar: bar,
        model: 'bolthead_m10',
        material: 'termination',
        position: [x, y, dOffset - dScale*3],
        scale: [tSize, tSize, tSize]
      });
      pattern.objects.push({
        bar: bar,
        model: 'boltrod_m10',
        material: 'termination',
        position: [x, y, dOffset - dScale*3],
        scale: [tSize, tSize, tSize]
      });
      pattern.objects.push({
        bar: bar,
        model: 'washer_m10',
        material: 'termination',
        position: [x, y, dOffset + dScale*3],
        rotation: [0, 0, r],
        scale: [tSize, tSize, tSize]
      });
      pattern.objects.push({
        bar: bar,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, dOffset + washerHeight + dScale * 3],
        rotation: [0, 0, r],
        scale: [tSize, tSize, tSize]
      });
      pattern.objects.push({
        bar: bar,
        model: 'splitwasher_m10',
        material: 'termination',
        position: [x, y, dOffset + washerHeight + nutHeight + dScale * 3],
        rotation: [0, 0, r],
        scale: [tSize, tSize, tSize]
      });
      pattern.objects.push({
        bar: bar,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, dOffset + washerHeight + nutHeight + splitWasherHeight + dScale * 3],
        rotation: [0, 0, r],
        scale: [tSize, tSize, tSize]
      });
      let labelY = y - 16;
      if(totalRows===1) labelY = y - 20;
      pattern.labels.push({
        x: x,
        y: y,
        bar: bar,
        text: size,
        textPos: [x, labelY, 0]
      });
    };
    const makeHole = (x, y, size, bar, totalRows) => {
      let labelY = y - 16;
      if(totalRows===1) labelY = y - 20;
      pattern.labels.push({
        x: x,
        y: y,
        bar: bar,
        text: size,
        textPos: [x, labelY, 0]
      });
      size = +size.replace(/M/g,'') / 10;
      pattern.holes.push({
        bar: bar,
        model: 'barhole',
        material: 'bar',
        position: [x, y, dOffset],
        scale: [size, size, dScale],
        morph: [0]
      });
    };
    const makeFill = (x,y,w,h,d,bar) => {
      pattern.scaffolding.push({
        model: 'barfill',
        material: 'bar',
        bar: bar,
        position: [x, y, dOffset],
        scale: [w, h, dScale],
        length: 1,
        height: 1
      });
    }
    let clickboxCount = 0;
    
    let rounded = ['Hard drawn plain copper', 'Hard drawn tinned copper'].includes(selection.base.barMaterial) && barSize[0]===50 && barSize[1]===6 ? 0 : 1;
    console.log('rounded', rounded);
    selection.bars.forEach((bar, l) => { 
      const has50mmSpacing = bar.columns.reduce((res, col) => col.terminationsSpacing==="50mm", false);
      rounded = has50mmSpacing ? rounded : 1;
      if(barSize[0]<=50) bar.linkType = 'Swing';
      else bar.linkType = 'Slide';
      const aTerminator = {
        repeatCount: 1,
        terminationsSpacing:'50mm',
        rows: [{
          fittingType:'Insulator',
          terminationsSize:'M12'
        }],
        spacing: 50,
        hasOffset: false,
        first: true,
        last: true,
        isInsulator: true
      };
      const startTerminator = JSON.parse(JSON.stringify(aTerminator));
      startTerminator.rows[0].isLink = (l > 0) || (selection.base.connectingLinks && /start/i.test(selection.base.connectingLinks));
      const endTerminator = JSON.parse(JSON.stringify(aTerminator));
      endTerminator.rows[0].isLink = (l < selection.bars.length - 1) || (selection.base.connectingLinks && /end/i.test(selection.base.connectingLinks));
      //task
      //column could come before first insulator or after last
      //distance between columns and other columns/insulators
      //row y positions - row spacing
      const subcolumns = [startTerminator, ...bar.columns, endTerminator].reduce((res, column, c) => {
        res = [...res, ...new Array(+column.repeatCount).fill(0).map((b,i) => {
          return {
            spacing: parseInt(column.terminationsSpacing),
            hasOffset: column.rows.reduce((res,row) => (row.offset==='Yes') || res,false),
            first: i===0,
            last: i===+column.repeatCount -1,
            firstOfCol: i===0,
            lastOfCol: i===+column.repeatCount -1,
            rows: column.rows,
            isInsulator: column.rows.reduce((res,row) => (row.fittingType==='Insulator') || res, false),
            hasHoles: column.rows.reduce((res,row) => (row.fittingType==='Hole') || res, false),
            repeatCount: +column.repeatCount,
            column: c,
          };
        })];
        return res;
      }, []);
      const getRowY = (subcol, r) => barSize[0]/2 - (barSize[0] / (subcol.rows.length + 1)) * (r + 1);
      const calculatePositions = (subcolumns) => {
        let x = 0;
        subcolumns.forEach(subcolumn => {
          subcolumn.x = x;
          x += subcolumn.spacing;
          if(subcolumn.hasOffset && subcolumn.last)
            x += subcolumn.spacing / 2;
        });
        return x;
      }
      const calculateInsulatorDistances = (subcolumns) => {
        let lastInsulatorPos = -1;
        return subcolumns.reduce((res, subcolumn) => {
          if(subcolumn.isInsulator) {
            if(lastInsulatorPos > -1) {
              res.push(subcolumn.x - lastInsulatorPos);
            }
            lastInsulatorPos = subcolumn.x;
          }
          return res;
        }, []);
      }
      const insertInsulators = (subcolumns, noInsulators) => {
        let totalLength = calculatePositions(subcolumns);
        let insulatorDistances = calculateInsulatorDistances(subcolumns);
        const mySubcols = JSON.parse(JSON.stringify(subcolumns));
        if(insulatorDistances[0] > 500) {
          noInsulators = noInsulators || Math.floor(insulatorDistances[0] / 500);
          const insulators = new Array(noInsulators).fill(0).map((b, i) => ({pos:(insulatorDistances[0] / (noInsulators + 1)) * (i + 1)}));
          let index = 0;
          mySubcols.forEach((subCol, i) => {
            if(!insulators[index]) return;
            if(subCol.x > insulators[index].pos) {
              insulators[index].index = i;
              index++;
            }
          });
          insulators.reverse().forEach(insulator => {
            mySubcols.splice(insulator.index, 0, JSON.parse(JSON.stringify(endTerminator)));
            mySubcols[insulator.index - 1].last = true;
          });
          totalLength = calculatePositions(mySubcols);
          insulatorDistances = calculateInsulatorDistances(mySubcols);
        }
        return [mySubcols, totalLength, insulatorDistances, noInsulators];
      }
      let [mySubcols, totalLength, insulatorDistances, noInsulators] = insertInsulators(subcolumns);     
      const allGood = insulatorDistances.every(distance => distance < 500);
      if(!allGood) {
        [mySubcols, totalLength] = insertInsulators(subcolumns, noInsulators + 1);
      }
      pattern.barDimensions[l] = {width:totalLength};
      bar.length = totalLength;
      const labels = [];
      const clickbox = {start:0,end:0};
      const holesData = {};
      mySubcols.forEach((subcol, s) => {
        if(s > 0 && s < mySubcols.length - 1) {
          if(subcol.firstOfCol) clickbox.start = subcol.x;
          if(subcol.lastOfCol) {
            clickbox.end = subcol.x + subcol.spacing;
            if(subcol.hasOffset) clickbox.end += subcol.spacing / 2
            pattern.clickboxes.push({
              position: [-totalLength/2 + clickbox.start + (clickbox.end - clickbox.start) / 2, 0],
              hue: clickboxCount++ / 10,
              width: clickbox.end - clickbox.start,
              length: barSize[0],
              height: barSize[1],
              column: subcol.column,
              bar: l
            });
            if(!subcol.hasHoles)
              pattern.scaffolding.push({
                bar: l,
                model: 'barfill',
                material: 'bar',
                position: [-totalLength/2 + clickbox.start + (clickbox.end - clickbox.start)/2, 0, dOffset],
                scale: [(clickbox.end - clickbox.start) / 10, (barSize[0] - 10)/10, dScale],
                length: 1,
                height: 1
              });
            else {
              let rowsY = new Array(subcol.rows.length + 1).fill(0).map((i, r) => {
                let tSize = 0;
                if(r===0) {
                  tSize = parseInt(subcol.rows[r].terminationsSize.replace(/M/g,''));
                  return {start:barSize[0]/2 - 5,end:getRowY(subcol, r) + tSize/2};
                }
                else if(r===subcol.rows.length) {
                  tSize = parseInt(subcol.rows[r-1].terminationsSize.replace(/M/g,''));
                  return {start:getRowY(subcol, r-1) - tSize/2,end:-barSize[0]/2 + 5}
                }
                else {
                  tSize = parseInt(subcol.rows[r-1].terminationsSize.replace(/M/g,''));
                  let start = getRowY(subcol, r-1) - tSize/2;
                  tSize = parseInt(subcol.rows[r].terminationsSize.replace(/M/g,''));
                  let end = getRowY(subcol, r) + tSize/2;
                  return {start, end};
                }
              });
              rowsY.forEach(r => {
                makeFill(-totalLength/2 + clickbox.start + (clickbox.end - clickbox.start)/2, r.start + (r.end - r.start)/2,(clickbox.end - clickbox.start) / 10, (r.end - r.start) / 10, null, l);
              });
              subcol.rows.forEach((row,r) => {
                if(row.fittingType!=='Hole') {
                  makeFill(-totalLength/2 + clickbox.start + (clickbox.end - clickbox.start)/2, getRowY(subcol, r) ,(clickbox.end - clickbox.start) / 10, (parseInt(row.terminationsSize.replace(/M/g,'')) / 10), null, l);
                }
              })
            }
          }
        }
        else if(s===0) {
          const w = subcol.spacing - 10;
          makeFill(-totalLength/2 + 10 + w/2, 0, w/10, (barSize[0] - 10)/10 , null, l)
        }
        else {
          const w = subcol.spacing - 10;
          makeFill(totalLength/2 - 10 - w/2, 0, w/10, (barSize[0] - 10)/10, null, l )
        }
        subcol.rows.forEach((row, r) => {
          let rowy = getRowY(subcol, r);
          let rowx = -totalLength/2 + subcol.x + subcol.spacing/2;
          if(row.offset==='Yes') rowx += subcol.spacing / 2;
          if(row.fittingType==='Termination')
            makeTerminator(rowx, rowy, row.terminationsSize, r, subcol.rows.length, l);
          else if(row.fittingType==='Hole') {
            makeHole(rowx, rowy, row.terminationsSize, l, subcol.rows.length);
            const id = subcol.column + '_' + r;
            holesData[id] = holesData[id] || [];
            if(subcol.firstOfCol) {
              holesData[id].push({x:-totalLength/2 + subcol.x,y:rowy,s:0});
            }
            holesData[id].push({x:rowx,y:rowy,s:+row.terminationsSize.replace(/M/g,'')});
            if(subcol.lastOfCol) {
              const hd = {x:-totalLength/2 + subcol.x + subcol.spacing,y:rowy,s:0};
              if(subcol.hasOffset) hd.x += subcol.spacing / 2;
              holesData[id].push(hd);
            }
          }
          else {
            makeInsulator(rowx, rowy, row.terminationsSize, r, subcol.rows.length, row.isLink, l);
            if(s > 0 && s < mySubcols.length - 1)
              makeFill(rowx, rowy, subcol.spacing/10,(barSize[0] - 10)/10, null, l)
          }
          labels.push({x:rowx, y: rowy, bar: l});
        })
      });
      Object.keys(holesData).forEach(key => {
        const holesArr = holesData[key];
        const tSize = Math.max(...holesArr.map(h => h.s));
        holesArr.forEach((data, i) => {
          if(i===holesArr.length-1) return;
          const nextData = holesArr[i + 1];
          const startX = data.x + (data.s/2);
          const endX = nextData.x - (nextData.s/2);
          makeFill(startX + (endX - startX)/2, data.y, (endX - startX)/10, tSize/10, null, l);
        })
      })
      
      //scaffolding
      pattern.scaffolding.push({
        bar: l,
        model: 'barside',
        material: 'bar',
        position: [0, 0, dOffset],
        scale: [1,1,dScale],
        morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50]
      },{
        bar: l,
        model: 'barside',
        material: 'bar',
        position: [0, 0, dOffset],
        scale: [1, -1, dScale],
        morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50]
      });
      if(barSize[0] < 50) {
        pattern.scaffolding.push({
          bar: l,
          model: 'barend_sm',
          material: 'bar',
          position: [0, 0, dOffset],
          scale: [1,1,dScale],
          morph: [(totalLength - 100) / 100,(barSize[0] * 10 - 50) / 50, 0, rounded]
        },{
          bar: l,
          model: 'barend_sm',
          material: 'bar',
          position: [0, 0, dOffset],
          scale: [-1, 1, dScale],
          morph: [(totalLength - 100) / 100,(barSize[0] * 10 - 50) / 50, 0, rounded]
        })
      } else {
        pattern.scaffolding.push({
          bar: l,
          model: 'barend',
          material: 'bar',
          position: [0, 0, dOffset],
          scale: [1,1,dScale],
          morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50, 0, rounded]
        },{
          bar: l,
          model: 'barend',
          material: 'bar',
          position: [0, 0, dOffset],
          scale: [-1, 1, dScale],
          morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50, 0, rounded]
        })
      }
      
      pattern.objects.push({
        bar: l,
        model: 'bar',
        material: 'bar',
        position: [0,0,dOffset],
        scale: [1,1,dScale],
        morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50, rounded]
      });
      /*let xlabels = labels.reduce((res, label) => {
        if(!res.find(item => item.x === label.x)) res.push(label);
        return res;
      }, []);
      //xlabels = [{x:-totalLength/2,y:0},...xlabels,{x:totalLength/2,y:0}];
      xlabels.sort((a,b) => a.x > b.x ? 1 : -1);
      xlabels.forEach((pos, xl) => {
        const label = {
          bar: l,
          start: [pos.x, pos.y, 0],
          end: [pos.x, Math.max(70, barSize[0]/2 + 20), 0],
          width: 1,
          dash: [5,5]
        };
        if(xl>0) {
          const width = pos.x - xlabels[xl-1].x;
          if(width.toString().length>8) label.text = width.toFixed(2);
          else label.text = width;
          label.textPos = [pos.x - width/2, Math.max(50, barSize[0]/2 + 10), 0];
        }
        pattern.labels.push(label);
      })*/
    });
    pattern.barDimensions.forEach((dim, d) => {
      if(d===0) dim.x = 0;
      else {
        const prevDim = pattern.barDimensions[d-1];
        dim.x = prevDim.x + prevDim.width + 25;
      }
    });
    const lastDim = pattern.barDimensions.length ? pattern.barDimensions[pattern.barDimensions.length - 1] : {width:0,x:0};
    let totalWidth = lastDim.x + lastDim.width;
    pattern.width = totalWidth;
    let centerIndex = pattern.barDimensions.length / 2;
    let decalIndex = centerIndex;
    let distanceToCenter = pattern.barDimensions.length;
    pattern.barDimensions.forEach((bar, i) => {
      if(bar.width > 175) {
        const distance = Math.abs(i - centerIndex);
        if(distance < distanceToCenter) {
          decalIndex = i;
          distanceToCenter = distance;
        }
        else if(distance===distanceToCenter) {
          if(bar.width > pattern.barDimensions[decalIndex])
            decalIndex = i;
        }
      }
    })
    if(decalIndex && decalIndex % 1 !== 0) 
      decalIndex = Math.floor(decalIndex);
    let decalBar = pattern.barDimensions[decalIndex];
    if(barSize[0]<=50)
      pattern.decals.push({
        client: selection.base.client,
        type: 'Bar',
        bar: decalIndex,
        position:[0,barSize[0]/2 - 7,3 + dOffset * 2]
      });
    /*pattern.labels.forEach(label => {
      const sameX = pattern.labels.filter(item => (label.text && item.text && /^M/.test(label.text) && label.textPos[0]===item.textPos[0] && label.text===item.text && label.bar===item.bar)).sort((a,b) => a.textPos[1] - b.textPos[1]);
      sameX.forEach((label, i) => {
        if(i>0) {
          delete label.text;
          delete label.textPos;
        }
      })
    })*/
    pattern.height = 100;
    if(pattern.barDimensions.length) {
      ['objects', 'decals', 'clickboxes', 'holes', 'scaffolding'].forEach(prop => {
        const list = pattern[prop];
        list.forEach(item => {
          item.position[0] += pattern.barDimensions[item.bar].x + pattern.barDimensions[item.bar].width / 2 - totalWidth / 2;
        })
      });
      ['labels'].forEach(prop => {
        const list = pattern[prop];
        list.forEach(item => {
          if(item.x || item.x===0)
            item.x += pattern.barDimensions[item.bar].x + pattern.barDimensions[item.bar].width / 2 - totalWidth / 2;
          if(item.start)
            item.start[0] += pattern.barDimensions[item.bar].x + pattern.barDimensions[item.bar].width / 2 - totalWidth / 2;
          if(item.end)
            item.end[0] += pattern.barDimensions[item.bar].x + pattern.barDimensions[item.bar].width / 2 - totalWidth / 2;
          if(item.textPos)
            item.textPos[0] += pattern.barDimensions[item.bar].x + pattern.barDimensions[item.bar].width / 2 - totalWidth / 2;
        })
      });
    }
    let offset = 0;
    if(pattern.width) {
      selection.width = pattern.width;
      pattern.barSize = barSize;
      const myDimensions = JSON.parse(JSON.stringify(pattern.barDimensions));
      const linkTypes = selection.bars.map(bar => ({type:bar.linkType,flip:false}));
      if(selection.base.connectingLinks && ['Start', 'Start and end'].includes(selection.base.connectingLinks)) {
        linkTypes.unshift({type:'Swing',flip:true});
        myDimensions.unshift({width:100,x:-125});
        pattern.width += 75;
      }
      if(selection.base.connectingLinks && ['End', 'Start and end'].includes(selection.base.connectingLinks)) {
        const lastDim = myDimensions[myDimensions.length - 1];
        myDimensions.push({width:100,x:lastDim.x + lastDim.width + 25});
        linkTypes.push({type:'Swing',flip:false});
        pattern.width += 75;
      }
      selection.noLinks = 0;
      if(myDimensions.length > 1) {
        const linkLength = 50 + 50 + 25;
        myDimensions.forEach((dim, l) => {
          if(l===0) return;
          const linkX = dim.x + linkLength / 2 - totalWidth / 2 - 25 - 50;
          const gapWidth = 25;
          selection.noLinks++;
          pattern.objects.push({
            model: 'link_' + linkTypes[l-1].type.split(/\s/g)[0].toLowerCase(),
            material: 'linkbar',
            position: [linkX,0, dOffset + dScale*6],
            scale: [(linkTypes[l-1].flip?-1:1),1,dScale],
            morph: [(linkLength - 100) / 100,(barSize[0] - 50) / 50, rounded]
          });
          if(barSize[0]<=50 && barSize[0]>=30)
            pattern.decals.push({
              client: selection.base.client,
              type: 'Link',
              bar: l,
              position:[linkX,barSize[0]/2 - 14,barSize[0]/3 + 1],
              material: 'linkbar'
            });
          /*pattern.labels.push({
            start: [linkX, 0, 0],
            end: [linkX, 70, 0],
            width: 0,
            dash: [5,5],
            text: gapWidth,
            textPos: [linkX, 50, 0]
          });*/
        });
      }
      if(selection.base.connectingLinks) {
        if(selection.base.connectingLinks==='Start') offset += 75 / 2;
        if(selection.base.connectingLinks==='End') offset -= 75 / 2;
        /**/
        if(/start/i.test(selection.base.connectingLinks)) {
          makeInsulator((-selection.width / 2) - 50, 0, 'M10', 1, 1, true, 1);
          //xlabels.unshift({x:(-selection.width / 2) - 50 + offset,y:0});
          //makeXLabel(xlabels[0], 1);
        }
        if(/end/i.test(selection.base.connectingLinks)) {
          makeInsulator((selection.width / 2) + 50, 0, 'M10', 1, 1, true, 1);
          //xlabels.push({x:(-selection.width / 2) + 50 + offset,y:0});
          //makeXLabel(xlabels[xlabels.length-1], xlabels.length);
        }
      }
      if(!['Feet', 'None'].includes(selection.base.baseMaterial))
        pattern.objects.push({
          model: selection.base.baseProfile==='Top hat'?'base_tophat':'base',
          material: 'base',
          position: [0 - offset,0,-65.5],
          morph: [(pattern.width - 50) / 50,0]
        });
      if(selection.base.baseMaterial==='Feet') {
        const insulators = pattern.objects.filter(obj => obj.model==='insulator').map(obj => obj.position[0]);
        insulators.forEach(x => {
          pattern.objects.push({
            model: selection.base.baseProfile==='Top hat'?'base_tophat':'base',
            material: 'feet',
            position: [x,0,-65.5],
            morph: [0,0]
          });
        })
      }
    }
    console.log('offset', offset)
    pattern.labels.push({x:-pattern.width/2 - offset,y:Math.min(-70, -pattern.barSize[0] / 2 - 20)})
    pattern.labels.push({x:pattern.width/2 - offset,y:Math.min(-70, -pattern.barSize[0] / 2 - 20)})
    let xlabels = pattern.labels.reduce((res, label) => {
      if(!res.find(item => item.x === label.x)) res.push(label);
      return res;
    }, []);
    //xlabels = [{x:-totalLength/2,y:0},...xlabels,{x:totalLength/2,y:0}];
    xlabels.sort((a,b) => a.x > b.x ? 1 : -1);
    const makeXLabel = (pos, xl, below) => {
      let labelY = Math.max(70, barSize[0]/2 + 20);
      let labelTextY = Math.max(50, barSize[0]/2 + 10)
      if(below) {
        labelY = Math.min(-70, barSize[0]/2 - 20);
        labelTextY = Math.min(-60, barSize[0]/2 - 20)
      }
      const label = {
        type: 'xlabel',
        bar: 1,
        start: [pos.x, pos.y, 0],
        end: [pos.x, labelY, 0],
        width: 1,
        dash: [5,5]
      };
      if(xl>0) {
        const width = pos.x - xlabels[xl-1].x;
        if(width.toString().length>8) label.text = width.toFixed(2);
        else label.text = width;
        label.textPos = [pos.x - width/2, labelTextY, 0];
      }
      pattern.labels.push(label);
    }
    xlabels.forEach((pos, xl) => {
      makeXLabel(pos, xl);
    })
    const bars = pattern.objects.filter(obj => obj.model==='bar');
    if(bars.length > 1) {
      xlabels = bars.reduce((res, bar) => {
        console.log(bar);
        res.push({x:bar.position[0] - (bar.morph[0] * 50) - 50,y:-barSize[0]/2});
        res.push({x:bar.position[0] + (bar.morph[0] * 50) + 50,y:-barSize[0]/2});
        console.log(res);
        return res;
      }, [])
      xlabels.unshift({x:-pattern.width/2 - offset,y:Math.min(-70, barSize[0]/2 - 20)})
      xlabels.push({x:pattern.width/2 - offset,y:Math.min(-70, barSize[0]/2 - 20)})
      xlabels.forEach((pos, xl) => {
        makeXLabel(pos, xl, true);
      })
    }
    console.log(xlabels);
    if(offset) {
      Object.keys(pattern).forEach(key => {
        const arr = pattern[key];
        if(arr.length) arr.forEach(item => {
          if(item.position) item.position[0] += offset;
          if(item.start) item.start[0] += offset;
          if(item.end) item.end[0] += offset;
          if(item.textPos) item.textPos[0] += offset;
        })
      })
    }
    checkForDuplicates();
    updateInfo();
  };
  const addBar = () => {
    selection.bars.push({columns:[{rows:[{}]}]});
    renderMenu();
    update();
    render();
  };
  const addColumn = (barindex) => {
    selection.bars[barindex].columns.push({rows:[{}]});
    renderMenu();
    update();
    render();
  };
  const deleteBar = (barIndex) => {
    selection.bars.splice(barIndex, 1);
    renderMenu();
    update();
    render();
  }
  const deleteColumn = (barindex, index) => {
    selection.bars[barindex].columns.splice(index, 1);
    renderMenu();
    update();
    render();
  };
  const highlightColumn = (barIndex, colIndex) => {
    ebRenderer.highlightColumn(barIndex, colIndex + 1);
  };
  const clearHighlights = ebRenderer.clearHighlights;
  const setCameraView = ebRenderer.setCameraView;
  const updateProgress = (status, stage, total) => {
    const width = (stage / total) * 100;
    app.$('.working-info').innerHTML = app.fillTemplate(app.$('#progress').innerText, {width,status});
  };
  const save = async () => {
    updateProgress('Saving', 0, 1);
    workingElm.style.display = 'flex';
    selection.user = selection.user || auth.user.username;
    selection.id = selection.id || Math.floor(Math.random() * 999999999999).toString(36);
    if(selection.base.number) {
      selection.number = pad(+selection.base.number, 4);
    }
    else {
      selection.number = pad(selection.number || app.dashboard.getNextDrawingNo(), 4);
    }
    selection.version = selection.version || app.dashboard.getNextDrawingVersion(selection.number);
    selection.createDate = selection.createDate || new Date();
    selection.updateDate = new Date();
    selection.updatedBy = auth.user.username;
    delete selection.thumbnail;
    let noStages = 0;
    let stage = 0;
    const imgs = await ebRenderer.renderThumbnail(pattern, 400, 200, 500, 160, -Math.PI / 3.2, false, (progress) => {
      if(progress.noImages) noStages = progress.noImages * 2 + 2;
      if(progress.event==='image') updateProgress('Rendering image', ++stage, noStages);
      if(progress.event==='done') updateProgress('Finished rendering', ++stage, noStages);
    });
    selection.noImages = imgs.length;
    selection.components = [];
    if(selection.base.baseMaterial!=='None') {
      selection.components.push({
        type: 'Base material',
        name: 'Base',
        size: '1',
        length: selection.base.baseMaterial==='Feet'?50:selection.width,
        quantity: selection.base.baseMaterial==='Feet'?selection.noInsulators:1,
        material: selection.base.baseMaterial==='Feet'?selection.base.feetMaterial:selection.base.baseMaterial
      })
    }
    const barSize = selection.base.copperBarSize.replace(/\s*x\s*/, ' x ').replace('mm', '');
    selection.components.push(...selection.bars.reduce((res, bar) => {
      const prev = res.find(pbar => pbar.length === bar.length);
      if(prev) prev.quantity++;
      else res.push({
        type: 'Bar material / finish',
        name: 'Bar',
        size: barSize,
        length: bar.length,
        quantity: 1,
        material: selection.base.barMaterial
      })
      return res;
    }, []));
    if(selection.noLinks) {
      selection.components.push({
        type: 'Bar material / finish',
        name: 'Link',
        size: barSize,
        length: 75,
        quantity: selection.noLinks,
        material: selection.base.barMaterial
      })
    }
    const tCount = selection.bars.reduce((res, bar) => {
      bar.columns.forEach(column => {
        column.rows.forEach(row => {
          if(row.fittingType==='Termination') {
            res[row.terminationsSize] = res[row.terminationsSize] || 0;
            res[row.terminationsSize] += +column.repeatCount;
          }
        })
      })
      return res;
    }, {});
    const washerMaterial = (selection.base.terminationMaterial==='Brass (non-compliant)' ? 'Phosphor bronze': selection.base.terminationMaterial);
    selection.components.push({
      type: 'INSULATOR CONNECTION',
      name: 'Insulator',
      size: 'M10',
      quantity: selection.noInsulators,
      material: selection.base.insulatorMaterial
    });    
    selection.components.push({
      type: 'INSULATOR CONNECTION',
      name: 'Insulator bolt',
      size: 'M10x12',
      quantity: selection.noInsulators,
      material: "Stainless steel A2 grade 304 (non-compliant)"
    });    
    /*selection.components.push({
      type: 'INSULATOR CONNECTION',
      name: 'Insulator Dowel',
      size: 'M10x40',
      quantity: selection.noInsulators,
      material: selection.base.insulatorMaterial
    });*/
    
    Object.keys(tCount).forEach(size => {
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Bolt',
        size: size,
        quantity: tCount[size],
        material: selection.base.terminationMaterial
      });
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Nut',
        size: size,
        quantity: tCount[size] * 2,
        material: selection.base.terminationMaterial
      });
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Flat washer',
        size: size,
        quantity: tCount[size],
        material: selection.base.terminationMaterial
      });
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Split washer',
        size: size,
        quantity: tCount[size],
        material: washerMaterial
      });
    })
    const insNuts = selection.components.find(component => component.size==='M10' && component.name==='Nut');
    if(!insNuts) {
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Nut',
        size: 'M10',
        quantity: selection.noInsulators + (selection.base.connectingLinks.match(/(start|end)/gi).length),
        material: selection.base.terminationMaterial
      })
    }
    else {
      insNuts.quantity += selection.noInsulators + ((selection.base.connectingLinks.match(/(start|end)/gi) || {length:0}).length);
    }
    const insWashers = selection.components.find(component => component.size==='M10' && component.name==='Flat washer');
    if(!insWashers) {
      selection.components.push({
        type: 'TERMINATION CONNECTION',
        name: 'Flat washer',
        size: 'M10',
        quantity: selection.noInsulators,
        material: selection.base.terminationMaterial
      })
    }
    else {
      insWashers.quantity += selection.noInsulators;
    }
    selection.revisions = selection.revisions || [];
    const clone = (obj) => JSON.parse(JSON.stringify(obj));
    selection.revisions.push({user:auth.user.username,date:new Date(),noImages:selection.noImages,bars:selection.bars,base:selection.base});
    for(let i=0; i<imgs.length; i++) {
      updateProgress('Uploading image', ++stage, noStages);
      await API.post('WallisAPI', '/save-image', {body:{key:`thumbnails/${selection.id}-${selection.revisions.length}-${i}.png`,data:imgs[i],contentType:'image/png'}})
    }
    updateProgress('Uploading drawing', ++stage, noStages);
    const res = await API.post('WallisAPI', '/drawing', {body:selection});
    updateProgress('Done', 0, 1);
    workingElm.style.display = 'none';
    window.app.goto('dashboard');
  };
  const load = async (selection) => {
    selection = selection;
  };
  const renderThumbnail = async (_selection) => {
    //if(!canRenderThumbnails) return [];
    selection = _selection;
    update(true);
    delete selection.thumbnail;
    const imgs = await ebRenderer.renderThumbnail(pattern, 600, 150, 500, 150, -Math.PI / 3.2);
    selection.noImages = imgs.length;
    selection.revisions = selection.revisions || [];
    const clone = (obj) => JSON.parse(JSON.stringify(obj));
    selection.revisions.push({user:auth.user.username,date:new Date(),noImages:selection.noImages,bars:selection.bars,base:selection.base});
    for(let i=0; i<imgs.length; i++) {
      await API.post('WallisAPI', '/save-image', {body:{key:`thumbnails/${selection.id}-${selection.revisions.length}-${i}.png`,data:imgs[i],contentType:'image/png'}})
    }
    const res = await API.post('WallisAPI', '/drawing', {body:selection});
  }
  const renderPdf = async (_selection) => {
    selection = _selection;
    if(!selection.components) {
      return alert('Please re-save this bar');
    }
    const prices = await fetchPrices();
    const modal = Modal('pdf', {prices,selection:selection});
    /*const tCount = selection.bars.reduce((res, bar) => {
      bar.columns.forEach(column => {
        column.rows.forEach(row => {
          if(row.fittingType==='Termination') {
            res[row.terminationsSize] = res[row.terminationsSize] || 0;
            res[row.terminationsSize] += +column.repeatCount;
          }
        })
      })
      return res;
    }, {});*/
    //let barOptions = prices['Bar material / finish'][dictionary.barMaterial[selection.base.barMaterial]][selection.base.copperBarSize.replace(/\s*x\s*/, ' x ').replace('mm', '')];
    //let insulatorOptions = prices['INSULATOR CONNECTION'][dictionary.insulatorMaterial[selection.base.insulatorMaterial]]['M10'];
    //let terminationOptions = {};
    //Object.keys(tCount).forEach(size => {
    //  terminationOptions[size] = prices['TERMINATION CONNECTION'][dictionary.terminationMaterial[selection.base.terminationMaterial]][size];
    //});
    selection.components.forEach(component => {
      try {
        component.options = prices[component.type][dictionary[component.type][component.material]][component.size];
      }
      catch(e) {
        component.options = [];
      }
    })
    try {
      const result = await modal.open((modal, name, data) => {
        const redraw = () => {
          app.$('modal .components').innerHTML = app.fillTemplate(app.$('#modal-pdf-components').innerText, {selection});
        }
        modal.refresh = () => {
          if(event.target.className.includes('marginPercent')) {
            selection.marginPercent = (+event.target.value).toFixed(2);
          }
          else if(event.target.className.includes('margin')) {
            selection.margin = (+event.target.value).toFixed(2);
          }
          app.$$('.component-options select, .component-options input').forEach(input => {
            if(!input.id) return;
            app.evalInContext('selection.' + input.id + ' = ' + (isNaN(+input.value) || !input.value ? '"' + input.value + '"' : input.value), {selection});
            if(!event.target.className.includes('totalCost') && event.target.id) {
              app.evalInContext('selection.' + input.id.replace(/code|unitCost/,'totalCost') + ' = 0', {selection});
            }
            if(event.target.tagName==='SELECT') {
              app.evalInContext('selection.' + input.id.replace(/code/,'unitCost') + ' = 0', {selection});
            }
          })
          redraw();
        }
        modal.render = async (type) => {
          updateProgress('Rendering PDF', 0, 1);
          workingElm.style.display = 'flex';
          update(true);
          let noStages = 0;
          let stage = 0;
          const imgs = await ebRenderer.renderThumbnail(pattern, 2000, 600, 500, 170, 0, true, (progress) => {
            if(progress.noImages) noStages = ((progress.noImages * 3) * type==='customer'?2:1) + 2;
            if(progress.event==='image') updateProgress('Rendering image', ++stage, noStages);
            if(progress.event==='label') updateProgress('Rendering labels', ++stage, noStages);
            if(progress.event==='done') updateProgress('Finished rendering', ++stage, noStages);
          });
          selection.noImages = imgs.length;
          for(let i=0; i<imgs.length; i++) {
            updateProgress('Uploading image', ++stage, noStages);
            await API.post('WallisAPI', '/save-image', {body:{key:`plan/${selection.id}-${selection.revisions.length}-${i}.png`,data:imgs[i],contentType:'image/png'}})
          }
          if(type==='customer') {
            const imgs = await ebRenderer.renderThumbnail(pattern, 2000, 600, 500, 170, -Math.PI / 2, false, (progress) => {
              if(progress.event==='image') updateProgress('Rendering image', ++stage, noStages);
              if(progress.event==='label') updateProgress('Rendering labels', ++stage, noStages);
              if(progress.event==='done') updateProgress('Finished rendering', ++stage, noStages);
            });
            selection.noImages = imgs.length;
            for(let i=0; i<imgs.length; i++) {
              updateProgress('Uploading image', ++stage, noStages);
              await API.post('WallisAPI', '/save-image', {body:{key:`side/${selection.id}-${selection.revisions.length}-${i + imgs.length}.png`,data:imgs[i],contentType:'image/png'}})
            }
          }
          updateProgress('Rendering PDF', ++stage, noStages);
          const res = await API.post('WallisAPI', '/render-pdf', {body:{drawing:selection,type:type}});
          updateProgress('Done', 0, 1);
          console.log('drawing', selection);
          workingElm.style.display = 'none';
          window.location = `https://wallis-app-dev.s3.eu-west-1.amazonaws.com/pdf/${selection.id}-${selection.revisions.length}.pdf`;          
        }
        redraw();
        modal.refresh();
      });
    } catch(e) {console.log('e', e)}
    return;
    /******/

    //download pdf from api
  }
  const fetchPrices = async () => {
    return pricesJson;
  }
  const whiteMode = () => {
    const wmButton = document.querySelector('input.white-mode');
    if(wmButton.value.includes('Dark')) {
      ebRenderer.setClearColor(0x999999);
      wmButton.value = 'Light Mode';
      document.querySelector('.info').style.display = 'flex';
    }
    else {
      ebRenderer.setClearColor(0xffffff);
      wmButton.value = 'Dark Mode';
      document.querySelector('.info').style.display = 'none';
    }
    render();
  }
  /*
    startup
      get logged in user
      user
        render dashboard screen
      no user
        render login screen
  */
  const start = async (params) => {
    if(!params.firstStart)
      canRenderThumbnails = false;
    if(params.length) {
      selection = await app.dashboard.getDrawing(params[0]);
    }
    else {
      selection = JSON.parse(JSON.stringify(blankSelection));
    }
    if(selection.links && !selection.bars) selection.bars = selection.links;
    renderMenu();
    update();
    await ebRenderer.start();
    document.querySelector('input.white-mode').value = "Dark mode"
    whiteMode();
    //render();
  }
  const unload = () => {
    canRenderThumbnails = true;
  }
  return {start,unload,update,addBar,addColumn,deleteBar,deleteColumn,renderMenu,render,rerenderRows,rerenderColumnHeadings,highlightColumn,clearHighlights,setCameraView,save,load,renderThumbnail,renderPdf,whiteMode};
};