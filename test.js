const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');

let test = fs.readdirSync('./xmls/');
// console.log(test)

const fatturaXML = fs.readFileSync('./xmls/239_IT12363410155_00tmJ.xml');
const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
// fs.writeFileSync('fattura.json', json, err => {if(err) console.log(err)});
let fattura = JSON.parse(json);
console.log(fattura['n0:FatturaElettronica'])
// let myData = [];
// let individualFattura = {
//     'Numero Fattura': '',
//     'Fornitore': '',
//     'Data Scadenza': ''
// }

// try {
//     test.forEach((file) => {
//         const fatturaXML = fs.readFileSync('./xmls/' + file);
//         const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
//         let fattura = JSON.parse(json);
//         let dataScadenza = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
//         let numeroFattura = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
//         let fornitore = fattura['p:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
//         individualFattura = {
//             'Numero Fattura': numeroFattura,
//             'Fornitore': fornitore,
//             'Data Scadenza': dataScadenza
//         }
//         myData.push(individualFattura);
//     })
//     console.log(myData)
// } catch (err) {
//     test.forEach((file) => {
//         const fatturaXML = fs.readFileSync('./xmls/' + file);
//         const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
//         let fattura = JSON.parse(json);
//         let dataScadenza = fattura.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
//         let numeroFattura = fattura.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
//         let fornitore = fattura.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
//         individualFattura = {
//             'Numero Fattura': numeroFattura,
//             'Fornitore': fornitore,
//             'Data Scadenza': dataScadenza
//         }
//         myData.push(individualFattura);
//     })
//     console.log(err);
// }



// console.log(fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'])
