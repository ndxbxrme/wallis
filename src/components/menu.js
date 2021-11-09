const menu = {
  base:[
    {name:'Number',selector:'number',default:'',tooltip:'Bar number, leave blank for autonumbering.',min:1,max:1000000},
    {name:'Client',selector:'client',default:'Wallis',tooltip:'Client branding.'},
    {name:'Bar material/finish',selector:'barMaterial',default:'Hard drawn plain copper',tooltip:'Material/Finish of the Earth Bar.'},
    {name:'Bar size',selector:'copperBarSize',default:'50x6mm',tooltip:'Size of copper bar required on the Earth Bar.'},
    {name:'Termination material',selector:'terminationMaterial',tooltip:'Material of termination/connection points.',default:'Phosphor bronze'},
    {name:'Insulator material',selector:'insulatorMaterial',default:'Black reinforced polyester'},
    {name:'Insulator size',selector:'insulatorSize',default:'M10 x 40mm x 40mm',tooltip:'Size & style of insulators.'},
    {name:'Base',selector:'baseMaterial',default:'Black PVC (full length)',onchange:'app.editor.update() || app.editor.renderMenu() || app.editor.update() || app.editor.render()',tooltip:'Material/Finish of the Earth Bar base.'},
    {name:'Feet material',selector:'feetMaterial',default:'Black PVC'},
    {name:'Connecting links',selector:'connectingLinks',default:'None'},
    {name:'Quantity of Earth Bars',selector:'quantity',min:1,max:10,default:1}
  ],
  column: [
    {name:'Rows',selector:'norows',min:1,max:4,default:1,onchange:'app.editor.update() || app.editor.rerenderRows() || app.editor.update() || app.editor.render()',tooltip:'Number of <span class="red">rows</span>'},
    {name:'Repeat count',selector:'repeatCount',min:1,max:1000,default:1,onchange:'app.editor.update() || app.editor.rerenderColumnHeadings() || app.editor.render()',tooltip:'Number of termination/connection points on the Earth Bar; this option is for bolts c/w nuts, washers, etc.'},
    {name:'Terminations spacing',selector:'terminationsSpacing',default:'50mm',tooltip:'This is the spacing/gap between the termination/connection points.'}
  ],
  row: [
    {name:'Fitting type',selector:'fittingType',default:'Termination',onchange:'app.editor.update() || app.editor.renderMenu() || app.editor.update() || app.editor.render()',tooltip:'Size of termination/connection points (bolts c/w nuts, washers, etc.).'},
    {name:'Terminations size',selector:'terminationsSize',default:'M10',tooltip:'Size of termination/connection points (bolts c/w nuts, washers, etc.).'},
    {name:'Offset',selector:'offset',default:'No'}
  ]/*,
  rowlink: [
    //{name:'Fitting type',selector:'fittingType',default:'Termination',onchange:'app.editor.update() || app.editor.renderMenu() || app.editor.update() || app.editor.render()'},
    {name:'Link Type',selector:'linkType',default:'Swing',tooltip:'The type of disconnecting link required.'}
  ]*/
};
const options = {
  client: [
    'Wallis',
    'ETS',
    'No branding'
  ],
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
  baseProfile: [
    'Regular',
    'Top hat'
  ],
  feetMaterial: [
    //'Black PVC',
    'AVG galvanised steel',
    'stainless steel SS316',
    'ACHAN1 galvanised mild steel',
    'Bright zinc plated',
    'Hot dipped galvanised',
  ],
  connectingLinks: [
    'None',
    'Start',
    'End',
    'Start and end'
  ],
  copperBarSize: ['50x6mm', '75x6mm'],
  barMaterial: [
    'Hard drawn plain copper',
    'Hard drawn tinned copper',
    'Stainless steel',
    'Copper nickel plated',
    'Aluminium',
    //'Bright zinc plated',
    'Hot dipped galvanised',
    'Silver plated hard drawn copper'
  ],
  insulatorMaterial: ['Black reinforced polyester', 'LSF'],
  insulatorSize: ['M10 x 40mm x 40mm', 'Hexagonal', 'Other', 'None '],
  terminationMaterial: [
    'Phosphor bronze',
    'Brass (non-compliant)',
    'Bright zinc plated (non-compliant)',
    'Stainless steel A2 grade 304 (non-compliant)',
    'Stainless steel A4 grade 316(non-compliant)',
    'Brass nickel plated (non-compliant)',
  ],
  fittingType: [
    'Termination',
    //'Insulator',
    'Hole',
    //'Link'
  ],
  terminationsSize: [
    'M4', 'M5', 'M6', 'M7', 'M8', 'M10', 'M12', 'M14', 'M16'
  ],
  holesSize: [
    'M4', 'M5', 'M6', 'M7', 'M8', 'M10', 'M12', 'M14', 'M16', 'M18', 'M20'
  ],
  terminationsSpacing: [
    "10mm", "15mm", "20mm", "25mm", "30mm", "35mm", "40mm", "45mm", "50mm", "55mm", "60mm", "65mm", "70mm", "75mm"
  ],
  links: ['None', 'Single link', 'Multiple links'],
  linkType: [
    //'Lift off', 
    'Slide off', 
    'Swing', 
    //'90-degree link'
  ],
  offset: ['No', 'Yes']
};
module.exports = {menu, options};