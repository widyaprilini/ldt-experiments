const { loadAndShuffleCsv } = require("./csvHandler");
const { groupByBlock } = require("./dataHandler");
const { lockEsc } = require("./pageHandler");

module.exports = {
  loadAndShuffleCsv,
  groupByBlock,
  lockEsc
}