const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');
let atob = require('atob')
const re = /FatturaElettronica/;
const comoRegEx = /ntgen/i;
const PDFJS = require('pdfjs-dist')

let fileArray = fs.readdirSync('./ultimate/');

const PDV = ['SAVONA', 'EUSTACHI', 'MARGHERA', 'CARMAGNOLA', 'TICINESE', 'GIAN GIACOMO', 'COMO'];
const SAVONA = ['AGRICOLA VARESINA S.R.L.', ]
const TICINESE = ['AARON Service Srl']
const UFFICIO = ['NESPRESSO ITALIANA SPA', 'Notarbartolo & Gervasi S.p.A.', 'CARPOFORO SRL', 'EDOARDO SCINETTI', 'DriveNow Italy S.r.l. c/o BMW Group',];
const Delivero = [[17183, 'MARGHERA'], [82848, 'EUSTACHI'], [76908, 'CARMAGNOLA'], [77408, 'SAVONA'], [112001, 'TICINESE']]
const Glovo = [['P44026', 'CARMAGNOLA'], ['P2292', 'SAVONA'], ['P8413', 'MARGHERA'], ['P8280', 'EUSTACHI'], ['P94710', 'TICINESE']]
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
    for (let unit of data) {
        let buf = unit[1];
        let file = unit[0].xml
        try {
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
        } catch (error) {
            console.log(error)
            console.log('failed at getText', file)
        }
    }
    return pdfArray;
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
                } else if (comoRegEx.test(text)) {
                    check = true;
                    output.push([PDV[6], file])
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
const readingFile = async (fileArray) => {
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

const stringXML = async (fileArray) => {
    let stringArray = []
    for (let file of fileArray) {
        let check = false;
        error = file;
        const fatturaXML = fs.readFileSync('./ultimate/' + file);
        for (let _pdv of PDV) {
            if (fatturaXML.toString().toUpperCase().includes(_pdv)) {
                if (_pdv === "GIAN GIACOMO") {
                    check = true;
                    stringArray.push([PDV[4], file]);
                } else {
                    check = true;
                    stringArray.push([_pdv, file]);
                }
            } else if (comoRegEx.test(fatturaXML.toString())) {
                check = true;
                stringArray.push([PDV[6], file]);
            }
        }
        if (!check) {
            let result = 'No pdv in allegato';
            stringArray.push([result, file]);
        }
    }
    return stringArray;
}

//FETCHES THE DATA FROM THE NODES
const fetchData = async (array, file) => {
    let temp = {}
    try {
        array.FatturaElettronicaBody.DatiPagamento === undefined || array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento === undefined
            ? dataScadenza = ''
            : dataScadenza = array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento['_text']
        numeroFattura = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero['_text']
        dataFattura = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data['_text']
        array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione !== undefined
            ? fornitore = array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Denominazione['_text']
            : fornitore = array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Nome['_text'] + " " + array.FatturaElettronicaHeader.CedentePrestatore.DatiAnagrafici.Anagrafica.Cognome['_text']
        array.FatturaElettronicaBody.DatiPagamento !== undefined
            ? array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento === undefined
                ? importo = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento['_text']
                : importo = array.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento['_text']
            : importo = array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.ImportoTotaleDocumento['_text']
            // Checks if document is Credit Note
        if (array.FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.TipoDocumento['_text'] === 'TD04') {
            importo = importo * -1
            importo = importo.toString();
        }
        individualFattura.xml = file
        individualFattura.numeroFattura = numeroFattura
        individualFattura.dataScadenza = dataScadenza
        individualFattura.dataFattura = dataFattura
        individualFattura.fornitore = fornitore
        individualFattura.importo = importo
        Object.assign(temp, individualFattura)
        return temp;
    } catch (error) {
        console.log(error)
        console.log('failed at fetchData', file)
    }
}

//COMBINES THE INVOICE AND PDV DATA AND PUSHES IT TO INVOICE OBJECT
const pushData = async (invData, pdvData, xmlData) => {
    let tempData = []
    let newPdvData = []
    let check;
    let prev = []
    pdvData.map((data) => {
        check = false
        for (let xml of xmlData) {
            if (data[1] === xml[1]) {
                if (data[0] === xml[0]) {
                    check = true
                    if (data[1] !== prev) {
                        newPdvData.push(data)
                    }
                    prev = data[1]
                } else if (data[0] === "No pdv in allegato" && xml[0] !== "No pdv in allegato") {
                    // console.log('not equal' ,data[0],xml[0])
                    if (data[1] !== prev) {
                        newPdvData.push([xml[0], data[1]])
                    }
                    prev = data[1]
                } else {
                    if (data[1] !== prev) {
                        newPdvData.push(data)
                    }
                    prev = data[1]
                }
            }
        }
    })
    for (let invoices of invData) {
        let invoice = invoices[0];
        for (let file of newPdvData) {
            if (file[1] === invoice.xml) {
                invoice.puntoVendita = file[0]
                try {
                    //*************************************************** */
                    //USEFUL ONLY FOR INSERTING ACQUISTI
                    //*************************************************** */
                    switch(file[0]) {
                        case 'SAVONA':
                            fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Savona/${invoice.fornitore}_${file[1]}`)
                            break;
                        case 'EUSTACHI':
                            fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Eustachi/${invoice.fornitore}_${file[1]}`)
                            break;    
                        case 'MARGHERA':
                            fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Marghera/${invoice.fornitore}_${file[1]}`)
                            break;    
                        case 'CARMAGNOLA':
                            fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Carmagnola/${invoice.fornitore}_${file[1]}`)
                            break;    
                        case 'TICINESE':
                            fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Ticinese/${invoice.fornitore}_${file[1]}`)
                            break;    
                        default:
                            switch(invoice.fornitore) {
                                case 'Foodinho, SRL':
                                    fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Delivery/${invoice.fornitore}_${file[1]}`)
                                    break;
                                case 'DELIVEROO ITALY S.r.l.':
                                    fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Delivery/${invoice.fornitore}_${file[1]}`)
                                    break;
                                case 'Just-Eat Italy S.r.l':
                                    fs.renameSync('./ultimate/' + file[1], `./temp/Locali/Delivery/${invoice.fornitore}_${file[1]}`)
                                    break;
                                default:
                                    fs.renameSync('./ultimate/' + file[1], `./temp/Locali/${invoice.fornitore}_${file[1]}`)
                                    break;
                            }
                            break;
                        }        
                } catch (err) {
                    console.log(err)
                }    
            }
            for (let fornitore of UFFICIO) {
                if (invoice.fornitore === fornitore) {
                    invoice.puntoVendita = 'UFFICIO'
                }
            }
            for (let fornitore of SAVONA) {
                if (invoice.fornitore === fornitore) {
                    invoice.puntoVendita = 'SAVONA'
                }
            }
            for (let fornitore of TICINESE) {
                if (invoice.fornitore === fornitore) {
                    invoice.puntoVendita = 'TICINESE'
                }
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
                    if(invData.fornitore === "DELIVEROO ITALY S.r.l.") {
                        for (let codice of Delivero) {
                            if (array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale["_text"].includes(codice[0])) {
                                buf = codice[1]
                            }
                        }
                    } else if(invData.fornitore === "Foodinho, SRL") {
                        for (let codice of Glovo) {
                            if (array[1].FatturaElettronicaBody.DatiBeniServizi.DettaglioLinee.Descrizione["_text"].includes(codice[0])) {
                                buf = codice[1]
                            }
                        }
                    } else if (array[1].FatturaElettronicaBody.Allegati === undefined) {
                        let test = JSON.stringify(array[1].FatturaElettronicaBody)
                        buf = 0;
                    } else if (invData.fornitore === "MARR Spa") { //For suppliers like MARR which have an array of attachments
                        if (array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale === undefined) {
                            buf = "no pdv"
                        } else if (!Array.isArray(array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale)) {
                            console.log('im here')
                            let causale = array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale["_text"]
                            for (_pdv of PDV) {
                                if (causale.includes(_pdv)) {
                                    buf = _pdv;
                                }
                            }
                        } else {
                            for (let innerArray of array[1].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale) {
                                for (_pdv of PDV) {
                                    if (innerArray["_text"].includes(_pdv)) {
                                        buf = _pdv;
                                    }
                                }
                            }
                        }
                    } else if (array[1].FatturaElettronicaBody.Allegati.FormatoAttachment === undefined) { // usually means there are multiple attachments
                        attachments = array[1].FatturaElettronicaBody.Allegati
                        for (let attachment in attachments) {
                            if (attachment.FormatoAttachment === undefined) {
                                buf = 0;
                            } else {
                                if (attachment.FormatoAttachment['_text'] === "PDF") {
                                    const raw = attachment.Attachment["_text"]
                                    let bin = atob(raw)
                                    buf = Buffer.from(bin, 'binary')
                                } else {
                                    buf = 0;
                                }
                            }
                        }
                        buf = 0;
                    } else if (array[1].FatturaElettronicaBody.Allegati.FormatoAttachment['_text'] === "TXT") {
                        buf = 0;
                    } else {
                        const raw = array[1].FatturaElettronicaBody.Allegati.Attachment["_text"]
                        let bin = atob(raw)
                        buf = Buffer.from(bin, 'binary')
                    }
                    invDataArray.push([invData, buf])
                } catch (e) {
                    console.log(e, file);
                }
            } else { }
        }
    }
    return invDataArray
}

//MAIN FUNCTION
const mainTest = async () => {
    let entries = await readingFile(fileArray);
    let xmlPDV = await stringXML(fileArray)
    let data = await loop(entries)
    const pdf = await getText(data)
    let PDV = await pdv(pdf);
    let csvData = await pushData(data, PDV, xmlPDV);
    writeCSV(csvData)
}

//WRITE TO CSV FUNCTION
const writeCSV = async (data) => {
    const fields = ['xml', 'dataScadenza', '', 'fornitore', 'numeroFattura', 'dataFattura', 'puntoVendita', 'importo'];
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