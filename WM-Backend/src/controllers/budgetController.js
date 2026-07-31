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

  try {
    const result = await pool.query(
      `INSERT INTO budgets (user_id, month, income, needs_alloc, wants_alloc, savings_alloc)
       VALUES ($1, $2, $3,
               ROUND(($3 * 0.5)::numeric, 2),
               ROUND(($3 * 0.3)::numeric, 2),
               ROUND(($3 * 0.2)::numeric, 2))
       ON CONFLICT (user_id, month) DO UPDATE SET
         income = budgets.income + EXCLUDED.income,
         needs_alloc = ROUND(((budgets.income + EXCLUDED.income) * 0.5)::numeric, 2),
         wants_alloc = ROUND(((budgets.income + EXCLUDED.income) * 0.3)::numeric, 2),
         savings_alloc = ROUND(((budgets.income + EXCLUDED.income) * 0.2)::numeric, 2)
       RETURNING budget_id, income, needs_alloc, wants_alloc, savings_alloc`,
      [userId, month, income]
    );

    const row = result.rows[0];

    // Record an income transaction in the ledger for this payday event
    await pool.query(
      `INSERT INTO transactions (user_id, budget_id, type, amount, source, note)
       VALUES ($1, $2, 'income', $3, 'Payday Flow', 'Payday income received')`,
      [userId, row.budget_id, income]
    );

    res.status(201).json({
      budgetId: row.budget_id,
      totalIncome: Number(row.income),
      allocations: {
        needs: Number(row.needs_alloc),
        wants: Number(row.wants_alloc),
        savings: Number(row.savings_alloc),
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