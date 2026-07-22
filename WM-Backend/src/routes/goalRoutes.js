const express = require("express");
const {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} = require("../controllers/goalController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getGoals);
router.post("/", authenticateToken, createGoal);
router.patch("/:id", authenticateToken, updateGoal);
router.delete("/:id", authenticateToken, deleteGoal);

module.exports = router;
