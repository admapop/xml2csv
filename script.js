const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');
let atob = require('atob')
const re = /FatturaElettronica/;
const PDFJS = require('pdfjs-dist')

let fileArray = fs.readdirSync('./ultimate/');

const PDV = ['SAVONA', 'EUSTACHI', 'MARGHERA', 'CARMAGNOLA', 'TICINESE', 'GIAN GIACOMO',];
let myData = [];
const individualFattura = {
    xml: '',
    numeroFattura: '',
    fornitore: '',
    dataFattura: '',
    dataScadenza: '',
    importo: '',
    puntoVendita: ''
}
let error;

//FUNCTION USED BY getText() TO PROCESS PDF TEXT
const getPageText = async (pdf, pageNo) => {
    try {
        const page = await pdf.getPage(pageNo);
        const tokenText = await page.getTextContent();
        const pageText = tokenText.items.map(token => token.str).join('')
        return pageText;
    } catch (error) {
        console.log('failed at getPageText')
    }
}

// GET TEXT (FROM PDF OR OTHER MEANS) TO USE FOR PDV DETECTION
const getText = async (data) => {
    let pdfArray = []
    try {
        for (let unit of data) {
            let buf = unit[1];
            let file = unit[0].xml
            if (typeof buf === "string") {
                pdfArray.push([buf, file])
            } else if (typeof buf === "number") {
                buf = "No pdv in allegato"
                pdfArray.push([buf, file])
            } else {
                const pdf = await PDFJS.getDocument(buf);
                const maxPages = pdf['_pdfInfo'].numPages;
                const pageTextPromises = [];
                for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
                    pageTextPromises.push(getPageText(pdf, pageNo))
                }
                const pageTexts = await Promise.all(pageTextPromises)
                pdfArray.push([pageTexts.join(''), file])
            }
        }
        console.log(pdfArray)
        return pdfArray;
    } catch (error) {
        console.log(error)
        console.log('failed at getText')
    }
}

//CONTROLS AND SETS THE PDV FOR EVERY INVOICE
const pdv = async (pdf) => {
    let output = [];
    for (let individualPdf of pdf) {
        let check = false;
        let file = individualPdf[1];
        let text = individualPdf[0].toUpperCase();
        for (let pdv of PDV) {
            if (text.includes(pdv)) {
                if (pdv === "GIAN GIACOMO") {
                    check = true;
                    output.push([PDV[4], file]);
                } else {
                    check = true;
                    output.push([pdv, file]);
                }
            }
        }
        if (!check) {
            let result = 'No pdv in allegato';
            output.push([result, file]);
        }
    }
    return output;
}

//INITIAL READ OF ALL FILES
const readingFile = async (fileAarray) => {
    let entriesArray = []
    for (let file of fileArray) {
        const fatturaXML = fs.readFileSync('./ultimate/' + file);
        const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
        let fattura = JSON.parse(json);
        const entries = Object.entries(fattura);
        error = file;
        entriesArray.push([entries, file])
    }
    return entriesArray;
}

//FETCHES THE DATA FROM THE NODES
const fetchData = async (array, file) => {
    let temp = {}
    array.FatturaElettronicaBody.DatiPagamento === undefined || array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento === undefined
        ? dataScadenza = ''
        : dataScadenza = array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text']
    numeroFattura = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text']
    dataFattura = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text']
    array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione !== undefined
        ? fornitore = array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text']
        : fornitore = array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Nome['_text']
    array.FatturaElettronicaBody.DatiPagamento !== undefined
        ? importo = array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text']
        : importo = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento['_text']

    individualFattura.xml = file
    individualFattura.numeroFattura = numeroFattura
    individualFattura.dataScadenza = dataScadenza
    individualFattura.dataFattura = dataFattura
    individualFattura.fornitore = fornitore
    individualFattura.importo = importo
    Object.assign(temp, individualFattura)
    return temp;
}

//COMBINES THE INVOICE AND PDV DATA AND PUSHES IT TO INVOICE OBJECT
const pushData = async (invData, pdvData) => {
    let tempData = []
    for (let invoices of invData) {
        let invoice = invoices[0];
        for (let file of pdvData) {
            if (file[1] === invoice.xml) {
                invoice.puntoVendita = file[0]
            }
        }
        tempData.push(invoice)
    }
    return myData = tempData
}

//MAIN LOOP WHERE SOME CHECKS TAKE PLACE AND WHERE PDV PATH DECISION TAKES PLACE (number, string and pdf)
const loop = async (entries) => {
    let buf
    let file
    let invData
    let invDataArray = []
    for (let invoices of entries) {
        let rawInv = invoices[0]
        file = invoices[1]
        for (let array of rawInv) {
            if (re.test(array[0])) {
                error = file;
                invData = await fetchData(array[1], file)
                try {
                    if (array[1].FatturaElettronicaBody.Allegati === undefined) {
                        buf = 0;
                    } else if (array[1].FatturaElettronicaBody.Allegati.Attachment === undefined) { //For suppliers like MARR which have an array of attachments
                        if (array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale === undefined) {
                            buf = "no pdv"
                        } else {
                            for (let innerArray of array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale) {
                                for (_pdv of PDV) {
                                    if (innerArray["_text"].includes(_pdv)) {
                                        buf = _pdv;
                                    }
                                }
                            }
                        }
                    } else {
                        const raw = array[1].FatturaElettronicaBody.Allegati.Attachment["_text"]
                        let bin = atob(raw)
                        buf = Buffer.from(bin, 'binary')
                    }
                    invDataArray.push([invData, buf])
                } catch (e) {
                    console.log(e);
                    console.log(error);
                }
            } else { }
        }
    }
    return invDataArray
}

//MAIN FUNCTION
const mainTest = async () => {
    let entries = await readingFile(fileArray);
    let data = await loop(entries)
    const pdf = await getText(data)
    let PDV = await pdv(pdf);
    let csvData = await pushData(data, PDV);
    writeCSV(csvData)
}

//WRITE TO CSV FUNCTION
const writeCSV = async (data) => {
    const fields = ['xml', 'numeroFattura', 'dataScadenza', 'dataFattura', 'fornitore', 'importo', 'puntoVendita'];
    const opts = { fields };
    let csv;
    try {
        csv = await parse(data, opts);
        fs.writeFileSync('./Fatture_new.csv', csv, err => { if (err) console.log(err) })
        console.log(csv);
        return
    } catch (err) {
        console.error(err.name);
    }
}

mainTest();