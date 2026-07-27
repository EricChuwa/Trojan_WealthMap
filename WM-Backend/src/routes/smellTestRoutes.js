const express = require("express");
const router = express.Router();
const {
  analyzeSmellTest,
  followUp,
} = require("../controllers/smellTestController");

router.post("/", analyzeSmellTest);
router.post("/follow-up", followUp);

module.exports = router;