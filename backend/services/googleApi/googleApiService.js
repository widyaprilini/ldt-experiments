const config = require("../../config");
const sheets = require("../../connectors/googleApiConnector");
const { chunkArray } = require("../../helper/dataHelper");

async function appendToSheet(data, range) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.google.spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: data,
    },
  });
}

async function getSheetData(range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: config.google.spreadsheetId,
    range
  });

  return response.data.values || [];
}

async function getExistingKeys(range) {
  const rows = await getSheetData(range);

  return new Set(
    rows.map(row => `${row[0]}-${row[4]}`)
  );
}

async function safeAppendRows({
  respondentId,
  data,
  sheetRange,
  chunkSize = 100
}) {
  const existingKeys = await getExistingKeys(sheetRange);

  const filteredRows = data.filter((row) => {
    const key = `${respondentId}-${row[4]}`;
    return !existingKeys.has(key);
  });

  const chunks = chunkArray(filteredRows, chunkSize);

  for (const chunk of chunks) {
    try {
      console.log("Posting per chunk");
      await appendToSheet(chunk, sheetRange);
      console.log("Success posting per chunk")
    } catch (err) {
      console.error("Chunk failed, safe to retry:", err);
      throw err;
    }
  }
}

module.exports = { appendToSheet, safeAppendRows };