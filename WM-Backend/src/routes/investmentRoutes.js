const express = require("express");
const router = express.Router();
const { getInvestmentOptions } = require("../controllers/investmentController");

router.get("/", getInvestmentOptions);

module.exports = router;