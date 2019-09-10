const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');
const re = /FatturaElettronica/;


let fileArray = fs.readdirSync('../../../P7M output');
console.log(fileArray)
let serial = [];

let myData = [];
let individualFattura = {
    xml: '',
    fornitore: '',
    partitaIVA: '',
    dataFattura: '',
    numeroFattura: '',
    imponibile: '',
    IVA: '',
    totale: ''
}
let error;

fileArray.forEach((file) => {
    const fatturaXML = fs.readFileSync('../../../P7M output/' + file);
    const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
    let fattura = JSON.parse(json);
    const entries = Object.entries(fattura);
    let numeroFattura;
    let partitaIVA;
    let dataFattura;
    let fornitore;
    let importo;
    error = file;
    entries.forEach((array) => {
        if (re.test(array[0])) {
            error = file;
            // try {
            //     delete array[1].FatturaElettronicaBody.Allegati;
            // } catch (e) {
            //     console.log(e);
            //     console.log('this is the file', error);
            // }
            try {
                array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.Anagrafica.Denominazione !== undefined
                    ? fornitore = array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.Anagrafica.Denominazione['_text']
                    : fornitore = 'sconosciuto'
                array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.IdFiscaleIVA !== undefined
                    ? partitaIVA = array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.IdFiscaleIVA.IdPaese['_text'] + array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.IdFiscaleIVA.IdCodice['_text']
                    : partitaIVA = array[1].FatturaElettronicaHeader.CessionarioCommittente.DatiAnagrafici.CodiceFiscale['_text']
                dataFattura = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text']
                numeroFattura = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text']
                imponibile = array[1].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.ImponibileImporto['_text']
                IVA = array[1].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.Imposta['_text']
                array[1].FatturaElettronicaBody.DatiPagamento !== undefined
                    ? importo = array[1].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text']
                    : importo = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento['_text']
            } catch (e) {
                console.log(e);
                console.log(error);
            }
        } else { return }
    
        individualFattura = {
            xml: file,
            fornitore: fornitore,
            partitaIVA: partitaIVA,
            dataFattura: dataFattura,
            numeroFattura: numeroFattura,
            imponibile: imponibile,
            IVA: IVA,
            totale: importo
        }
        myData.push(individualFattura);
        serial.push(file);
    })
})

const fields = ['xml', 'fornitore', 'partitaIVA', 'dataFattura', 'numeroFattura', 'imponibile', 'IVA', 'totale'];
const opts = { fields };

try {
    const csv = parse(myData, opts);
    fs.writeFileSync('./Fatture_attive.csv', csv, err => { if (err) console.log(err) })
    console.log(csv);
} catch (err) {
    console.error(err.name);
}

// console.log(serial)