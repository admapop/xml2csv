const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');

const fatturaXML = fs.readFileSync('./MARR/5679_IT03725940237_NKE3F.xml');
const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
let fattura = JSON.parse(json);
// fs.writeFileSync('./Deliveroo/fatturaMARR.json', json, err => {if(err) console.log(err)});

fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale.forEach((array, i) => {
    x = array['_text']
    switch (x) {
        case 'Vendita':
            continue;
        case x.includes('MARGHERA'):
            console.log('it works')
            break;
    }

})

// console.log(fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale)