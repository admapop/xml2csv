const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');

const fatturaXML = fs.readFileSync('./xml_test.xml');

const json = convert.xml2json(fatturaXML, {compact: true, spaces: 4});
// fs.writeFileSync('fattura.json', json, err => {if(err) console.log(err)});

let fattura = JSON.parse(json);
let dataScadenza = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
let numeroFattura = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
let fornitore = fattura['p:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];

let myData = {
    'Numero Fattura': numeroFattura,
    'Fornitore': fornitore,
    'Data Scadenza': dataScadenza
}

// console.log(numeroFattura, dataScadenza)

// console.log(fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento)


const fields = ['Numero Fattura', 'Fornitore','Data Scadenza'];
const opts = {fields};

try {
    const csv = parse(myData, opts);
    // fs.writeFileSync('Fatture.csv', csv, err => {if(err) console.log(err)})
    console.log(csv);
  } catch (err) {
    console.error(err);
  }