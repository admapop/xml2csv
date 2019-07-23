const fs = require('fs');

const fattura = fs.readFileSync('./fattura.json');
let fatturaJSON = JSON.parse(fattura);
console.log(fatturaJSON.FatturaElettronica.FatturaElettronicaBody.DatiPagamento.DettaglioPagamento.DataScadenzaPagamento)
