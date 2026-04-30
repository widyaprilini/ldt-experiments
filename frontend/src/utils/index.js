const { loadAndShuffleCsv } = require("./csvHandler");
const { saveToLocal, groupByBlock } = require("./dataHandler");
const { lockEsc } = require("./pageHandler");

module.exports = {
  loadAndShuffleCsv,
  saveToLocal,
  groupByBlock,
  lockEsc
}