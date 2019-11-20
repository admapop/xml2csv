//*************************************************** */
//INPUT FOLDER
//*************************************************** */
const folder = './TEST/'

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