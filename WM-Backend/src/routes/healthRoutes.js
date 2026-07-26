const express = require("express");
const { getHealthHistory } = require("../controllers/healthController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getHealthHistory);

module.exports = router;