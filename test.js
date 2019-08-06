const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');
const re = /FatturaElettronica/;

let test = fs.readdirSync('./xmls/');
// console.log(test)

// const fatturaXML = fs.readFileSync('./COCA/234_IT12363410155_00sub.xml');
const fatturaXML = fs.readFileSync('./xmls2/6789_IT12883420155_3YILD.xml');
const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
// fs.writeFileSync('./xmls2/fattura.json', json, err => {if(err) console.log(err)});
let fattura = JSON.parse(json);
const entries = Object.entries(fattura)
delete entries[1][1].FatturaElettronicaBody.Allegati
console.log(entries[1][1].FatturaElettronicaBody)

// entries.forEach((array) => {
//     re.test(array[0]) 
//     ? console.log(array[1]) 
//     : 'bollocks' 
// })

// console.log(entries[1][1].FatturaElettronicaHeader)

// console.log(
//     fattura['ns0:FatturaElettronica'].FatturaElettronicaBody
//     )


// console.log(Array.isArray(fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo))







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
