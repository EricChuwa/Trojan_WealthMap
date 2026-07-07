const pool = require("../config/db");

const createBudget = async (req, res) => {
  const { month, income } = req.body;
  const userId = req.user.id; // comes from the JWT via auth middleware — never trust a user_id from the request body

  if (!month || income === undefined || income === null) {
    return res.status(400).json({
      success: false,
      message: "Please provide month and income.",
    });
  }

  if (typeof income !== "number" || income <= 0) {
    return res.status(400).json({
      success: false,
      message: "Income must be a positive number.",
    });
  }

  const needs = Math.round(income * 0.5 * 100) / 100;
  const wants = Math.round(income * 0.3 * 100) / 100;
  const savings = Math.round(income * 0.2 * 100) / 100;

  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, month, income, needs_alloc, wants_alloc, savings_alloc)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING budget_id`,
      [userId, month, income, needs, wants, savings]
    );

    res.status(201).json({
      budgetId: result.rows[0].budget_id,
      allocations: {
        needs,
        wants,
        savings,
      },
    });
  } catch (err) {
    console.error("Create budget error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  createBudget,
};