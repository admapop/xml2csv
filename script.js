const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');
const re = /FatturaElettronica/;


let fileArray = fs.readdirSync('./ultimate/');
let serial = [];

let myData = [];
let individualFattura = {
    'xml': '',
    'Numero Fattura': '',
    'Fornitore': '',
    'Data Fattura': '',
    'Data Scadenza': '',
    'Importo': ''
}
let error;

fileArray.forEach((file) => {
    const fatturaXML = fs.readFileSync('./ultimate/' + file);
    const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
    let fattura = JSON.parse(json);
    const entries = Object.entries(fattura);
    let numeroFattura;
    let dataScadenza;
    let dataFattura;
    let fornitore;
    let importo;
    error = file;
    entries.forEach((array) => {
        if (re.test(array[0])) {
            error=file;
            try {
                delete array[1].FatturaElettronicaBody.Allegati;
            } catch (e) {
                console.log(e);
                console.log('this is the file', error);    
            }
            try {
            array[1].FatturaElettronicaBody.DatiPagamento === undefined || array[1].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento === undefined
            ? dataScadenza= ''
            : dataScadenza= array[1].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text']
            numeroFattura = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text']
            dataFattura = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text']
            array[1].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione !== undefined
            ? fornitore = array[1].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text']
            : fornitore = array[1].FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Nome['_text']
            array[1].FatturaElettronicaBody.DatiPagamento !== undefined
            ? importo = array[1].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text']
            : importo = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento['_text']
        } catch (e) {
            console.log(e);
            console.log(error);
        }
        } else {return}
        
        individualFattura = {
            'xml': file,
            'Numero Fattura': numeroFattura,
            'Fornitore': fornitore,
            'Data Fattura': dataFattura,
            'Data Scadenza': dataScadenza,
            'Importo': importo
        }
        myData.push(individualFattura);
        serial.push(file);
    })
})

const fields = ['xml' ,'Numero Fattura', 'Fornitore', 'Data Fattura', 'Data Scadenza', 'Importo'];
const opts = { fields };

try {
    const csv = parse(myData, opts);
    fs.writeFileSync('./Fatture_new.csv', csv, err => {if(err) console.log(err)})
    console.log(csv);
} catch (err) {
    console.error(err.name);
}

console.log(serial)