const convert = require('xml-js');
const { parse } = require('json2csv');
const fs = require('fs');

let fileArray = fs.readdirSync('./Deliveroo/');

// causale (numero fattura)

let myData = [];
let fields = ['Numero Fattura', 'Data Documento', 'Causale', 'Totale Documento'];

let individualFattura = {
    'Numero Fattura': '',
    'Data Documento': '',
    'Causale': '',
    'Totale Documento': ''
}

let errorFile;

try {
    fileArray.forEach((file) => {
        const fatturaXML = fs.readFileSync('./Deliveroo/' + file);
        const json = convert.xml2json(fatturaXML, { compact: true, spaces: 4 });
        let fattura = JSON.parse(json);
        let numeroFattura;
        let causale;
        let dataFattura;
        let totDoc = 0;
        // let totImposta;
        // let totImponible;
        let filterImponibile = [];
        let filterImposta = [];
        let riepilogoImponibile = [];
        let riepilogoImposta = [];
        if (fattura['ns3:FatturaElettronica'] !== undefined) { //standard
            error = file;
            if (fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo === undefined) {
                error = file;
                riepilogoImponibile = '';
                riepilogoImposta = '';
                filterImponibile = 'Imponibile';
                filterImposta = 'Imposta';
            } else if(Array.isArray(fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo)) {
                fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.forEach((array, i) => {
                    riepilogoImponibile.push(array.ImponibileImporto["_text"]);
                    filterImponibile.push(`Imponibile${i + 1}`);
                    individualFattura[filterImponibile[i]] = riepilogoImponibile[i];
                    if(fields.includes(filterImponibile[i])) {
                        console.log('already included')
                    } else {
                        fields = fields.concat(filterImponibile[i]);
                    }
                    riepilogoImposta.push(array.Imposta['_text']);
                    filterImposta.push(`Imposta${i + 1}`);
                    individualFattura[filterImposta[i]] = riepilogoImposta[i];
                    if(fields.includes(filterImposta[i])) {
                        console.log('already included')
                    } else {
                        fields = fields.concat(filterImposta[i]);
                    }
                    // console.log(fields)

                })
 
            } else {
                riepilogoImponibile.push(fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.ImponibileImporto["_text"])
                riepilogoImposta.push(fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo.Imposta['_text'])
                filterImponibile.push(`Imponibile1`)
                filterImposta.push(`Imposta1`)
                individualFattura[filterImponibile[0]] = riepilogoImponibile[0];
                individualFattura[filterImposta[0]] = riepilogoImposta[0];
                console.log('output', riepilogoImponibile, riepilogoImposta)
            }
            error = file;
            numeroFattura = fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Numero["_text"];
            dataFattura = fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Data["_text"];
            totDoc = fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.ImportoPagamento["_text"];
            individualFattura['Numero Fattura'] = numeroFattura;
            individualFattura['Data Documento'] = dataFattura;
            individualFattura['Totale Documento'] = totDoc
            console.log('totale doc before', totDoc);
            console.log('fattura', individualFattura['Totale Documento'])
            if (fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale !== undefined) {
                error = file;
                causale = fattura['ns3:FatturaElettronica'].FatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale["_text"];
            } else {
                causale = '';
            }
        } else {
            console.log('missed invoices');
        }
        // console.log('fields', fields)
        // console.log('fattura', individualFattura)
        individualFattura = {
            // 'Numero Fattura': numeroFattura,
            // 'Data Documento': dataFattura,
            'Causale': causale,
            // 'Totale Documento': totDoc,
            // 'Totale Imposta': totImposta,
            // 'Totale Imponibile': totImponible
        }
        myData.push(individualFattura);
    })
} catch (err) {
    console.log(error);
}

const opts = { fields };

try {
    const csv = parse(myData, opts);
    fs.writeFileSync('Fatture.csv', csv, err => {if(err) console.log(err)})
    console.log(csv);
} catch (err) {
    console.error(err);
}