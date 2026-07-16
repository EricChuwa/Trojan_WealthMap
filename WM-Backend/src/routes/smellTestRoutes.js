const express = require("express");

const router = express.Router();

const {
  analyzeSmellTest,
} = require("../controllers/smellTestController");

router.post("/", analyzeSmellTest);

module.exports = router;