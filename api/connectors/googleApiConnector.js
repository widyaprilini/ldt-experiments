const config = require("../config");

const { google } = require("googleapis");

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: config.google.clientEmail,
    private_key: config.google.privateKey
  },
  scopes: [config.google.authScope],
});

const sheets = google.sheets({ version: "v4", auth });

module.exports = sheets;