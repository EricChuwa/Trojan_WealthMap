const express = require("express");
const {
  getFlowMonth,
  getTransactions,
  createGroup,
  updateGroup,
  deleteGroup,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/flowController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// every Flow route requires a valid token
router.use(authenticateToken);

router.post("/groups", createGroup);
router.patch("/groups/:groupId", updateGroup);
router.delete("/groups/:groupId", deleteGroup);

router.post("/items", createItem);
router.patch("/items/:itemId", updateItem);
router.delete("/items/:itemId", deleteItem);

// specific routes first so "/groups" isn't captured by "/:month"
router.get("/:month/transactions", getTransactions);
router.get("/:month", getFlowMonth);

module.exports = router;