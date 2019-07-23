const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');

let fileArray = fs.readdirSync('./xmls/');

let myData = [];
let individualFattura = {
    'Numero Fattura': '',
    'Fornitore': '',
    'Data Fattura': '',
    'Data Scadenza': '',
    'Importo': ''
}

try {
    fileArray.forEach((file) => {
        const fatturaXML = fs.readFileSync('./xmls/' + file);
        const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
        let fattura = JSON.parse(json);
        let numeroFattura;
        let dataScadenza;
        let dataFattura;
        let fornitore;
        let importo;
        if (fattura['p:FatturaElettronica'] !== undefined) { //standard
            dataScadenza = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura['p:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura['p:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        } else if(fattura['b:FatturaElettronica'] !== undefined) { //Fine Food
            dataScadenza = fattura['b:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura['b:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura['b:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura['b:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura['b:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        } else if(fattura.FatturaElettronica !== undefined) { //Carlsberg
            dataScadenza = fattura.FatturaElettronica.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura.FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura.FatturaElettronica.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura.FatturaElettronica.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura.FatturaElettronica.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        } else if(fattura['n0:FatturaElettronica'] !== undefined) { //Coca Cola
            dataScadenza = fattura['n0:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura['n0:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura['n0:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura['n0:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura['n0:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        } else if(fattura['q1:FatturaElettronica'] !== undefined){ //random
            dataScadenza = fattura['q1:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura['q1:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura['q1:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura['q1:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura['q1:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        } else { //random
            dataScadenza = fattura['ns5:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text'];
            numeroFattura = fattura['ns5:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text'];
            dataFattura = fattura['ns5:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text'];
            fornitore = fattura['ns5:FatturaElettronica'].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text'];
            importo = fattura['ns5:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text'];
        }

        individualFattura = {
            'Numero Fattura': numeroFattura,
            'Fornitore': fornitore,
            'Data Fattura': dataFattura,
            'Data Scadenza': dataScadenza,
            'Importo': importo
        }
        myData.push(individualFattura);
    })
} catch (err) {
    console.log(err)
}

const fields = ['Numero Fattura', 'Fornitore', 'Data Fattura', 'Data Scadenza', 'Importo'];
const opts = { fields };

try {
    const csv = parse(myData, opts);
    fs.writeFileSync('Fatture.csv', csv, err => {if(err) console.log(err)})
    console.log(csv);
} catch (err) {
    console.error(err.name);
}