const config = require("../../config");
const sheets = require("../../connectors/googleApiConnector");

async function appendToSheet(data) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: config.google.spreadsheetId,
    range: "result!B:M",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: data,
    },
  });
}

module.exports = { appendToSheet };