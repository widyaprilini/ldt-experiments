require("dotenv").config();

const config = {
  port: process.env.PORT || 5000,

  google: {
    clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
    privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    authScope: process.env.GOOGLE_AUTH_SCOPE,
    spreadsheetId: process.env.SPREAD_SHEET_ID,
  },

  app: {
    env: process.env.NODE_ENV || "dev",
  },
};

module.exports = config;