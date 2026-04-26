const express = require("express");
const router = express.Router();

const { saveLextaleResponseHandler } = require("./lextale.handler");

router.post("/response", saveLextaleResponseHandler);

router.get("/health-check", (req, res) => {
  res.status(200).json({
      message: "Health Check: OK"
    });
});

module.exports = router;