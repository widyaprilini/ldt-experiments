const express = require("express");
const router = express.Router();

const { saveLdtResponseHandler } = require("./ldt.handler");

router.post("/response", saveLdtResponseHandler);

module.exports = router;