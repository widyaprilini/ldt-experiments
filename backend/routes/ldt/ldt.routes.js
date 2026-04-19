const express = require("express");
const router = express.Router();

const { saveLdtResponseHandler } = require("./ldt.handler");

router.post("/response", saveLdtResponseHandler);

router.get("/health-check", (req, res) => {
  res.status(200).json({
      message: "Backend OK"
    });
});

module.exports = router;