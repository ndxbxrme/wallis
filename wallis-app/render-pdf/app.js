const chromium = require('chrome-aws-lambda');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const path = require('path');
exports.lambdaHandler = async (event, context) => {
  const fillTemplate = (template, data) => {
    return template.replace(/\{\{(.+?)\}\}/g, function(all, match) {
      const evalInContext = (str, context) => {
        return (new Function(`with(this) {return ${str}}`)).call(context);
      };
      return evalInContext(match, data);
    });
  };
  try {
    const {drawing,type} = JSON.parse(event.body);
    const MAX_IMAGES_PER_PAGE = 3;
    const executablePath = event.isOffline
      ? './node_modules/puppeteer/.local-chromium/mac-674921/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
      : await chromium.executablePath;
    browser = await chromium.puppeteer.launch({ignoreDefaultArgs: ['--disable-extensions'], args: chromium.args, executablePath,})
    const page = await browser.newPage();
    const template = await new Promise((res) => fs.readFile(path.join(__dirname, `template-${type}.html`), 'utf8', (err, data) => res(data)));
    const pageTemplate = await new Promise((res) => fs.readFile(path.join(__dirname, `page-template-${type}.html`), 'utf8', (err, data) => res(data)));
    const totalImages = type === 'customer' ? drawing.noImages * 2 : drawing.noImages;
    const pages = new Array(Math.ceil(totalImages / MAX_IMAGES_PER_PAGE)).fill(0).map((f,i) => {
      drawing.page = i + 1;
      drawing.totalPages = Math.ceil(totalImages / MAX_IMAGES_PER_PAGE);
      let index = i * MAX_IMAGES_PER_PAGE;
      const maxImages = index + MAX_IMAGES_PER_PAGE;
      let images = '';
      while((index < maxImages) && (index < drawing.noImages)) {
        console.log('index', index, 'maxImages', maxImages);
        if(type==='customer' && index===0) images += '<h1>Customer: Plan view</h1>';
        images += 
        `<div style="background-image: url(https://wallis-app-dev.s3.eu-west-1.amazonaws.com/plan/${drawing.id}-${drawing.revisions.length}-${index}.png)"></div>`;
        index++;
      }
      if(type==='customer') {
        while((index < maxImages) && (index < totalImages)) {
          console.log('index', index, 'maxImages', maxImages);
          if(index===drawing.noImages) images += '<h1>Customer: Side view</h1>';
          images += 
          `<div style="background-image: url(https://wallis-app-dev.s3.eu-west-1.amazonaws.com/side/${drawing.id}-${drawing.revisions.length}-${index}.png)"></div>`;
          index++;
        }
      }
      console.log('images');
      drawing.images = images;
      drawing.clients = {
        "Wallis": {
          "logo": "lightning-logo.png",
          "address": "AN Wallis & Co Ltd\nGreasley Street\nBulwell\nNottingham\nNG6 8NG\nTel: +44 (0) 115 927 1721\nEmail: info@an-wallis.com"
        },
        "ETS": {
          "logo": "ETS Logo.png",
          "address": "ETS Cable Components\nUnit 43 Barwell Business Park\nLeatherhead Road\nChessington\nSurrey\nKT9 2NY\nTel: +44 (0) 208 405 6789\nEmail: sales@etscablecomponents.com"
        }
      };

      drawing.getStudAssembly = (selection) => {
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
          console.log(selection);
        let html = '';
        if(selection.total.studs && selection.total.studs.length) html += `${selection.total.studs.join(' & ')}`;
        if(selection.total.terminations) html += ` x ${selection.total.terminations} ${selection.base.terminationMaterial} Hex Head Set c/w Flat Washer, Spring Washer & 2 x Nuts`;
        return html;
      };
      drawing.pad = (n,i) => (i = Math.max(i, n.toString().length)) && (new Array(i).fill(0).join('') + n).substr(-i,i);
      return fillTemplate(pageTemplate, drawing);
    }).join('');
    const html = fillTemplate(template, {pages});
    console.log(html);
    await page.emulateMediaType('print');
    await page.setViewport({
      width:3508,
      height:2480
    });
    await page.setContent(html, { waitUntil: ['load', 'domcontentloaded', 'networkidle0'] });
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      landscape: true,
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    const s3Params = {
      Bucket: 'wallis-app-dev',
      Key: `pdf/${drawing.id}-${drawing.revisions.length}.pdf`,
      Body: pdf,
      ContentType: 'application/pdf'
    }
    await s3.putObject(s3Params).promise();
    response = {
      'statusCode': 200,
      'headers': {
        "Access-Control-Allow-Headers" : "Authorization",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
      },
      'body': JSON.stringify('done')
    }
  } catch (err) {
    console.log(err);
    return err;
  }

  return response
};
