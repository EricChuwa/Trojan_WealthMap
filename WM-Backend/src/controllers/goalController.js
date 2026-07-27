const pool = require("../config/db");

// monthsLeft is always derived from progress against the pace the user
// committed to at creation (monthly_required), never stored or echoed back
// from client input. This is what makes it shrink as saved_amount grows,
// and adjust automatically if target_amount is edited later.
function mapGoal(row) {
  const targetAmount = Number(row.target_amount);
  const savedAmount = Number(row.saved_amount);
  const monthlyRequired = Number(row.monthly_required);
  const monthsLeft =
    row.status === "completed"
      ? 0
      : Math.max(0, Math.ceil((targetAmount - savedAmount) / monthlyRequired));

  return {
    id: row.goal_id,
    name: row.name,
    category: row.category,
    targetAmount,
    savedAmount,
    monthlyRequired,
    monthsLeft,
    status: row.status,
  };
}

const getGoals = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "SELECT * FROM goals WHERE user_id = $1 ORDER BY target_date ASC NULLS LAST",
      [userId],
    );

    res.status(200).json({
      success: true,
      goals: result.rows.map(mapGoal),
    });
  } catch (err) {
    console.error("Get goals error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const createGoal = async (req, res) => {
  const { name, category, targetAmount, monthsLeft, savedAmount: rawSaved } = req.body;
  const userId = req.user.id; // comes from the JWT via auth middleware — never trust a user_id from the request body

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: "Please provide a goal name and category.",
    });
  }

  if (typeof targetAmount !== "number" || targetAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Target amount must be a positive number.",
    });
  }

  if (!Number.isInteger(monthsLeft) || monthsLeft <= 0) {
    return res.status(400).json({
      success: false,
      message: "Months to reach goal must be a positive whole number.",
    });
  }

  // savedAmount is optional on creation — defaults set to 0
  const parsedSaved = Number(rawSaved);
  const savedAmount = !isNaN(parsedSaved) && parsedSaved >= 0 ? parsedSaved : 0;

  if (savedAmount > targetAmount) {
    return res.status(400).json({
      success: false,
      message: "Saved amount cannot exceed the target amount.",
    });
  }

  // The pace: locked in now, never silently recalculated by later edits.
  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsLeft);
  const monthlyRequired = Math.round((targetAmount / monthsLeft) * 100) / 100;
  const status = savedAmount >= targetAmount ? "completed" : "active";

  try {
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, category, target_amount, target_date, monthly_required, saved_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, name, category, targetAmount, targetDate, monthlyRequired, savedAmount, status],
    );

    res.status(201).json({
      success: true,
      goal: mapGoal(result.rows[0]),
    });
  } catch (err) {
    console.error("Create goal error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

// Edits only ever touch name/category/target_amount/saved_amount — the pace
// (monthly_required) and deadline (target_date) set at creation are never
// touched here, so monthsLeft (derived in mapGoal) stays a true reflection
// of progress against the original commitment.
const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { name, category, targetAmount, savedAmount } = req.body;
  const userId = req.user.id;

  if (!name || !category) {
    return res.status(400).json({
      success: false,
      message: "Please provide a goal name and category.",
    });
  }

  if (typeof targetAmount !== "number" || targetAmount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Target amount must be a positive number.",
    });
  }

  if (typeof savedAmount !== "number" || savedAmount < 0) {
    return res.status(400).json({
      success: false,
      message: "Saved amount must be a non-negative number.",
    });
  }

  if (savedAmount > targetAmount) {
    return res.status(400).json({
      success: false,
      message: "Saved amount cannot exceed the target amount.",
    });
  }

  const status = savedAmount >= targetAmount ? "completed" : "active";

  try {
    // A completed goal is locked — no further edits, by design.
    const existing = await pool.query(
      "SELECT status FROM goals WHERE goal_id = $1 AND user_id = $2",
      [id, userId],
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    if (existing.rows[0].status === "completed") {
      return res.status(409).json({
        success: false,
        message: "This goal is already completed and can't be edited.",
      });
    }

    const result = await pool.query(
      `UPDATE goals
       SET name = $1, category = $2, target_amount = $3, saved_amount = $4, status = $5
       WHERE goal_id = $6 AND user_id = $7
       RETURNING *`,
      [name, category, targetAmount, savedAmount, status, id, userId],
    );

    res.status(200).json({
      success: true,
      goal: mapGoal(result.rows[0]),
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }
    console.error("Update goal error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const deleteGoal = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      "DELETE FROM goals WHERE goal_id = $1 AND user_id = $2 RETURNING goal_id",
      [id, userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Goal deleted.",
    });
  } catch (err) {
    console.error("Delete goal error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
};
