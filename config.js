//*************************************************** */
//INPUT FOLDER
//*************************************************** */
const folder = '../Fatture 01-11 - 14-11/xml/'

//*************************************************** */
//MOVE INVOICES TO RELATIVE FOLDERS?
//*************************************************** */
const moveByPDV = false
const destinationFolder = './Locali/'

//*************************************************** */
//WRITE CSV FILE?
//*************************************************** */
const writeToCSV = true
const writeFileName = 'Fatture_14-11-19'

module.exports = {
  folder,
  moveByPDV,
  destinationFolder,
  writeToCSV,
  writeFileName
}