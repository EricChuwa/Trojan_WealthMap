const express = require("express");
const { createBudget } = require("../controllers/budgetController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createBudget);

module.exports = router;