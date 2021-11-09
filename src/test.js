console.clear();
const App = async () => {
  let selection = {
    base: {},
    links: [{columns:[]}]
  };
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
  const ebRenderer = EBRenderer(undefined, undefined, pattern, 'https://www.rainstormweb.com/earthbar/');
  const menu = {
    base:[
      {name:'Bar material/finish',selector:'barMaterial',default:'Hard drawn plain copper',tooltip:'Tooltip text'},
			{name:'Bar size',selector:'copperBarSize',default:'50x6mm'},
			{name:'Termination material',selector:'terminationMaterial'},
			{name:'Insulator material',selector:'insulatorMaterial',default:'Black reinforced polyester'},
			{name:'Insulator size',selector:'insulatorSize',default:'M10 x 40mm x 40mm'},
			{name:'Base',selector:'baseMaterial',default:'Black PVC (full length)',onchange:'app.update() || app.renderMenu() || app.update() || app.render()'},
      {name:'Feet material',selector:'feetMaterial',default:'Black PVC'},
      {name:'Quantity of Earth Bars',selector:'quantity',min:1,max:10,default:1}
    ],
    column: [
      {name:'Rows',selector:'norows',min:1,max:3,default:1,onchange:'app.update() || app.rerenderRows() || app.update() || app.render()',tooltip:'Number of rows, you fool!'},
      {name:'Repeat count',selector:'repeatCount',min:1,max:10,default:1,onchange:'app.update() || app.rerenderColumnHeadings() || app.render()',tooltip:'Hooo haaah'},
      {name:'Terminations spacing',selector:'terminationsSpacing',default:'50mm'}
    ],
    row: [
      {name:'Fitting type',selector:'fittingType',default:'Termination',onchange:'app.update() || app.renderMenu() || app.update() || app.render()'},
      {name:'Terminations size',selector:'terminationsSize',default:'M10'},
      {name:'Offset',selector:'offset',default:'No'}
    ],
    rowlink: [
      {name:'Fitting type',selector:'fittingType',default:'Termination',onchange:'app.update() || app.renderMenu() || app.update() || app.render()'},
      {name:'Link Type',selector:'linkType',default:'Swing'}
    ]
  }
  const options = {
    baseMaterial: [
      'Black PVC (full length)',
      'AVG galvanised steel (full length)',
      'Stainless steel SS316 (full length)',
      'ACHAN1 galvanised mild steel (full length)',
      'Bright zinc plated (full length)',
      'Hot dipped galvanised (full length)',
      'Feet',
      'None',
    ],
    feetMaterial: [
      'Black PVC',
      'AVG galvanised steel',
      'stainless steel SS316',
      'ACHAN1 galvanised mild steel',
      'Bright zinc plated',
      'Hot dipped galvanised',
    ],
    copperBarSize: ['50x6mm', '75x6mm'],
    barMaterial: [
      'Hard drawn plain copper',
      'Hard drawn tinned copper',
      'Stainless steel',
      'Copper nickel plated',
      'Aluminium',
      'Bright zinc plated',
      'Hot dipped galvanised',
    ],
    insulatorMaterial: ['Black reinforced polyester', 'LSF'],
    insulatorSize: ['M10 x 40mm x 40mm', 'Hexagonal', 'Other', 'None '],
    terminationMaterial: [
      'Phosphor bronze',
      'Brass (non-compliant)',
			'Brass zinc plated',
      'Stainless steel – (non-compliant)',
      'Nickel plated phosphor bronze – (non-compliant)',
    ],
    fittingType: [
      'Termination',
      'Insulator',
      'Link'
    ],
    terminationsSize: [
      'M4', 'M6', 'M8', 'M10', 'M12', 'M16', 'M18', 'M20', 'M22'
    ],
    terminationsSpacing: [
      '10mm', '20mm', '30mm', '40mm', '50mm', '60mm', '70mm'
    ],
    links: ['None', 'Single link', 'Multiple links'],
    linkType: ['Lift off', 'Slide off', 'Swing', '90-degree link'],
    offset: ['No', 'Yes']
  };
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
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
			case 'Brass zinc plated':
        return {name:materialName,color:[0,0.7,0.7],metalness:0.8,roughness:0.3};
      case 'Bright zinc plated (full length)':
      case 'Bright zinc plated':
        return {name:materialName,color:[0.54,0.11,0.76],metalness:1,roughness:0};
      case 'Copper nickel plated':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Hard drawn tinned copper':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Hard drawn plain copper':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Hot dipped galvanised (full length)':
      case 'Hot dipped galvanised':
        return {name:materialName,color:[0.53,0.32,0.84],metalness:0.8,roughness:0.3};
      case 'Nickel plated phosphor bronze – (non-compliant)':
        return {name:materialName,color:[0,0.5,0.7],metalness:0.8,roughness:0.3};
      case 'Phosphor bronze':
        return {name:materialName,color:[0.063,0.95,0.75],metalness:1,roughness:0.1};
      case 'Stainless steel SS316 (full length)':
      case 'Stainless steel SS316':
        return {name:materialName,color:[0.68,0.06,0.67],metalness:0.8,roughness:0.3};
      case 'Stainless steel – (non-compliant)':
      case 'Stainless steel':
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
      let html = `<label>${menuItem.name}</label>`;
      const ttid = Math.floor(Math.random() * 999999999).toString(36);
      if(menuItem.tooltip) {
        html += `<span id='id${ttid}' class='tt'>?</span>`;
        setTimeout(() => tippy('#id' + ttid, {content:menuItem.tooltip}));
      }
      else {
        html += '<span></span>';
      }
      if(menuItem.min || menuItem.max) {
        html += `<input type="number" name="${menuItem.selector}" value="${values[menuItem.selector] || menuItem.default}" min="${menuItem.min || 0}" max="${menuItem.max || 10}" onchange="${menuItem.onchange || 'app.update() || app.render()'}" />`;
      }
      else {
        html += `<select name='${menuItem.selector}' onchange="${menuItem.onchange || 'app.update() || app.render()'}">`;
        html += (opts[menuItem.selector] || []).map(option => `<option ${(values[menuItem.selector]===option)||(!values[menuItem.selector] && menuItem.default===option)?'selected':''}>${option}</option>`).join('');
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
    let baseHtml = renderSection(menu.base, options, selection.base);
    document.querySelector('#menu .base form').innerHTML = baseHtml;
    const feetMaterialElem = document.querySelector('#menu .base select[name="feetMaterial"]');
    feetMaterialElem.disabled = selection.base.baseMaterial!=='Feet';
    let linksHtml = '<div class="link">' + selection.links.map((link, l) => {
      let c = 1;
      let columnsHtml = link.columns.map((column, i) => {
        let html = '<div class="column">';
        html += `<h3>Column${+column.repeatCount>1&&'s'||''} ${c}${+column.repeatCount>1&&' - ' + (c+(+column.repeatCount - 1)) || ''}</h3>`;
        c += +column.repeatCount;
        html += '<form class="colform">' + renderSection(menu.column, options, column) + '</form>';
        html += renderRows(column);
        html += `<input type="button" onclick="app.deleteColumn(${l},${i})" value="Remove" />`;
        html += '</div>';
        return html;
      }).join('');
      columnsHtml += `<input type="button" onclick="app.addColumn(${l})" value="Add bar section" />`;
      return `<h2>Bar section ${l + 1}</h2>` + columnsHtml;
    }) + '</div>';
    document.querySelector('#menu .links').innerHTML = linksHtml;
    //update();
  };
  const rerenderRows = () => {
    const columnElem = event.target.parentNode.parentNode;
    const linkElem = columnElem.parentNode;
    const colIndex = Array.from(linkElem.children).indexOf(columnElem) - 1;
    const linkIndex = Array.from(linkElem.parentNode.children).indexOf(linkElem);
    console.log(colIndex, linkIndex, selection, );
    const column = selection.links[linkIndex].columns[colIndex];
    columnElem.querySelector('.rows').innerHTML =  renderRows(column);
  }
  const rerenderColumnHeadings = () => {
    document.querySelectorAll('#menu .link').forEach((linkElem, l) => {
      let c = 1;
      linkElem.querySelectorAll('.column').forEach((columnElem, i) => {
        const heading = columnElem.querySelector('h3');
        const column = selection.links[l].columns[i];
        heading.innerHTML = `Column${+column.repeatCount>1&&'s'||''} ${c}${+column.repeatCount>1&&' - ' + (c+(+column.repeatCount - 1)) || ''}`;
        c += +column.repeatCount;
      });
    })
    
  };
  const update = () => {
    selection.base = Array.from(document.querySelectorAll('#menu .base select, #menu .base input')).reduce((res, elm) => {
      res[elm.name] = elm.value;
      return res;
    }, {});
    selection.links = Array.from(document.querySelectorAll('#menu .link')).map((linkelm, l) => {
      return {columns:Array.from(linkelm.querySelectorAll('.column')).map((columnelm, f) => {
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
      })};
    });
    localStorage.setItem('eb', JSON.stringify(selection));
    pattern.materials = ['base','feet','bar','insulator','termination'].map(name => getMaterial(selection.base[name + 'Material'],name));
    pattern.objects = [];
    pattern.labels = [];
    pattern.decals = [];
    const makeInsulator = (x, y, size, rowNo, totalRows, link) => {
      
      pattern.objects.push({
        link: link,
        model: 'bolt_m10',
        material: 'termination',
        position: [x, y, 35/2 - 6],
        scale: [1.2, 1.2, 1]
      });
      pattern.objects.push({
        link: link,
        model: 'bolt_m10',
        material: 'termination',
        position: [x, y, -35],
        scale: [1.2, 1.2, 1]
      });
      pattern.objects.push({
        link: link,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, 8],
        scale: [1.2, 1.2, 1],
        rotation: [0,0,Math.random() * Math.PI * 2],
        morph: [0.4]
      });
      pattern.objects.push({
        link: link,
        model: 'insulator',
        material: 'insulator',
        position: [x, y, -21]
      });
      pattern.labels.push({
        link: link,
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
    const makeTerminator = (x, y, size, rowNo, totalRows, link) => {
      const r = Math.random() * Math.PI * 2;
      pattern.objects.push({
        link: link,
        model: 'bolt_m10',
        material: 'termination',
        position: [x, y, 35/2 - 6]
      });
      pattern.objects.push({
        link: link,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, 8],
        rotation: [0, 0, r]
      });
      pattern.objects.push({
        link: link,
        model: 'nut1_m10',
        material: 'termination',
        position: [x, y, 17],
        rotation: [0, 0, r]
      });
      let labelY = y - 16;
      if(totalRows===1) labelY = y - 20;
      pattern.labels.push({
        link: link,
        text: size,
        textPos: [x, labelY, 0]
      });
    };
    const barSize = selection.base.copperBarSize.match(/\d+/g).map(i => +i);
    selection.links.forEach((link, l) => {
      const endTerminator = {
        repeatCount: 1,
        terminationsSpacing:'50mm',
        rows: [{
          fittingType:'Insulator',
          terminationsSize:'M12'
        }]
      };
      let totalLength = 0;
      [endTerminator, ...link.columns, endTerminator].forEach(column => {
        const hasOffset = column.rows.reduce((res,row) => (row.offset==='Yes') || res,false);
        totalLength += +column.repeatCount * (parseInt(column.terminationsSpacing) || 50);
        if(hasOffset) totalLength += (parseInt(column.terminationsSpacing) || 50)  / 2;
        console.log('tl', totalLength);
        //totalLength += Math.max(...column.rows.map(row => +column.repeatCount * (parseInt(column.terminationsSpacing) || 50) + (row.offset==='Yes'?parseInt(column.terminationsSpacing)/2:0)));
        if(isNaN(totalLength)) debugger;
      });
      const maxInsulatorSpacing = 500;
      let insulators = [];
      let insulatorsPos = [];
      if(totalLength > maxInsulatorSpacing) {
        const noInsulators = Math.floor(totalLength / maxInsulatorSpacing);
        totalLength += noInsulators * 50;
        link.columns.forEach(column => {
          const hasOffset = column.rows.reduce((res,row) => (row.offset==='Yes') || res,false);
          //if(hasOffset) totalLength += parseInt(column.terminationsSpacing) / 2;
        })
        insulators = new Array(noInsulators).fill(0).map((b, i) => -(totalLength/2) + (totalLength / (noInsulators + 1)) * (i + 1));
      }
      console.log(insulators);
      let colx = -totalLength / 2;
      const labels = [];
      let minx = 0, maxx = 0;
      [endTerminator, ...link.columns, endTerminator].forEach((column, c) => {
        let maxrowx = 0;
        column.rows.forEach((row, r) => {
          const spacing = parseInt(column.terminationsSpacing) || 50;
          //if(c===0) colx += 25;
          let rowx = 0;
          if(row.offset==='Yes') rowx += spacing / 2;
          let rowy = barSize[0]/2 - (barSize[0] / (column.rows.length + 1)) * (r + 1);
          new Array(+column.repeatCount).fill(0).forEach((u,i) => {
            const hasOffset = column.rows.reduce((res,row) => (row.offset==='Yes') || res,false);
            insulators.forEach((insulator, j) => {
              let myrowx = rowx + (hasOffset&&row.offset==='No'&&i>0?spacing/2:0);
              if(colx + myrowx + spacing/2 > insulator - 25 && colx + myrowx - spacing/2 < insulator + 25) {
                //if(i===0) colx -= 25;
                insulatorsPos[j] = Math.max(-totalLength/2, colx + myrowx + 25 + totalLength/2);
                rowx += 50 + (hasOffset&&i>0?spacing/2:0);
              }
            });
            rowx += spacing / 2;
            labels.push({x:colx + rowx, y: rowy, link: l});
            minx = Math.min(minx, colx + rowx);
            maxx = Math.max(maxx, colx + rowx);
            if(row.fittingType==='Termination')
              makeTerminator(colx + rowx, rowy, row.terminationsSize, r, column.rows.length, l);
            else
              makeInsulator(colx + rowx, rowy, row.terminationsSize, r, column.rows.length, l);
            rowx += spacing / 2;
          })
          maxrowx = Math.max(rowx, maxrowx);
        });
        colx += maxrowx;
      });
      const diff = (totalLength - (maxx - minx + 50)) / 2;
      totalLength = (maxx - minx + 50);
      pattern.objects.filter(object => object.link===l).forEach(object => {
        object.position[0] += diff;
      });
      pattern.labels.filter(label => label.link===l).forEach(label => {
        if(label.start) label.start[0] += diff;
        if(label.end) label.end[0] += diff;
        if(label.textPos) label.textPos[0] += diff;
      });
      console.log('diff', diff);
      labels.forEach(label => label.x += diff);
      console.log(pattern);
      insulatorsPos.forEach(insulatorX => {
        console.log('making insulator at', insulatorX);
        makeInsulator(insulatorX - totalLength/2, 0, 'M12', null, null, l)
        labels.push({x:insulatorX - totalLength/2,y:0,link:l});
      });
      if(!['Feet', 'None'].includes(selection.base.baseMaterial))
        pattern.objects.push({
          model: 'base',
          material: 'base',
          position: [0,0,-63],
          morph: [(totalLength - 50) / 50,0]
        });
      pattern.objects.push({
        model: 'bar',
        material: 'bar',
        position: [0,0,0],
        morph: [(totalLength - 100) / 100,(barSize[0] - 50) / 50]
      });
      let xlabels = labels.reduce((res, label) => {
        if(!res.find(item => item.x === label.x)) res.push(label);
        return res;
      }, []);
      xlabels = [{x:-totalLength/2,y:0},...xlabels,{x:totalLength/2,y:0}];
      xlabels.sort((a,b) => a.x > b.x ? 1 : -1);
      xlabels.forEach((pos, l) => {
        const label = {
          start: [pos.x, pos.y, 0],
          end: [pos.x, 70, 0],
          width: 2,
          dash: [5,5]
        };
        if(l>0) {
          const width = pos.x - xlabels[l-1].x;
          if(width.toString().length>8) label.text = width.toFixed(2);
          else label.text = width;
          label.textPos = [pos.x - width/2, 50, 0];
        }
        pattern.labels.push(label);
      })
      let ylabels = labels.reduce((res, label) => {
        if(!res.find(item => item.y === label.y)) res.push(label);
        return res;
      }, []);
      ylabels.sort((a,b) => a.y > b.y ? 1 : -1);
      ylabels = [{x:-totalLength/2,y:-barSize[0]/2},...ylabels,{x:-totalLength/2,y:barSize[0]/2}].sort((a,b)=>a.y-b.y);
      ylabels.forEach((pos, l) => {
        const label = {
          start: [-totalLength/2, pos.y, 0],
          end: [-totalLength/2 - 30, pos.y, 0],
          width: 2,
          dash: [5,5]
        };
        if(l>0) {
          const height = pos.y - ylabels[l-1].y;
          if(height.toString().length>8) label.text = height.toFixed(2);
          else label.text = height;
          label.textPos = [-totalLength/2 - 14, pos.y - height/2 - 3, 0];
        }
        pattern.labels.push(label);
      })
      pattern.labels.push({
        start: [-totalLength/2,70,0],
        end: [totalLength/2,70,0],
        width: 2,
        dash: [5, 5],
        text: 'Overall length: ' + totalLength,
        textPos: [0, 80, 0]
      });
      pattern.labels.push(...[{
        start: [totalLength/2,barSize[0]/2,0],
        end: [totalLength/2 + 30,barSize[0]/2,0],
        width: 2,
        dash: [5,5]
      },{
        start: [totalLength/2,-barSize[0]/2,0],
        end: [totalLength/2 + 30,-barSize[0]/2,0],
        width: 2,
        dash: [5,5],
        textPos: [totalLength/2 + 14, 0 - 3,0],
        text: barSize[0]
      }])
      pattern.width = totalLength + 30;
    });
    pattern.decals.push({
      position:[0,barSize[0]/2 - 7,3]
    })
    pattern.labels.forEach(label => {
      const sameX = pattern.labels.filter(item => (label.text && item.text && /^M/.test(label.text) && label.textPos[0]===item.textPos[0] && label.text===item.text)).sort((a,b) => a.textPos[1] - b.textPos[1]);
      sameX.forEach((label, i) => {
        if(i>0) {
          delete label.text;
          delete label.textPos;
        }
      })
    })
    pattern.height = 100;
  };
  const addColumn = (linkindex) => {
    selection.links[linkindex].columns.push({rows:[{}]});
    renderMenu();
    update();
    render();
  };
  const deleteColumn = (linkindex, index) => {
    selection.links[linkindex].columns.splice(index, 1);
    renderMenu();
    update();
    render();
  };
  selection = JSON.parse(localStorage.getItem('eb') || 'null') || selection;
  renderMenu();
  update();
  await ebRenderer.start();
  //render();
  return {update,addColumn,deleteColumn,renderMenu,render,rerenderRows,rerenderColumnHeadings};
}

(async () => {
  window.app = await App();
  console.log('tippy', tippy);
  //window.ebRenderer = EBRenderer(undefined, undefined, pattern, 'https://www.rainstormweb.com/earthbar/');
  //await window.ebRenderer.start();
})();