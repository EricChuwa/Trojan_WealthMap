const pool = require("../config/db");

function monthsBetween(from, to) {
  let months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth());
  if (to.getDate() < from.getDate()) months -= 1;
  return Math.max(months, 0);
}

function mapGoal(row, monthsLeftOverride) {
  return {
    id: row.goal_id,
    name: row.name,
    category: row.category,
    targetAmount: Number(row.target_amount),
    savedAmount: Number(row.saved_amount),
    monthsLeft:
      monthsLeftOverride !== undefined
        ? monthsLeftOverride
        : monthsBetween(new Date(), new Date(row.target_date)),
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
      goals: result.rows.map((row) => mapGoal(row)),
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
  const { name, category, targetAmount, monthsLeft } = req.body;
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

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsLeft);
  const monthlyRequired = Math.round((targetAmount / monthsLeft) * 100) / 100;

  try {
    const result = await pool.query(
      `INSERT INTO goals (user_id, name, category, target_amount, target_date, monthly_required, saved_amount, status)
       VALUES ($1, $2, $3, $4, $5, $6, 0, 'active')
       RETURNING *`,
      [userId, name, category, targetAmount, targetDate, monthlyRequired],
    );

    res.status(201).json({
      success: true,
      goal: mapGoal(result.rows[0], monthsLeft),
    });
  } catch (err) {
    console.error("Create goal error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const updateGoal = async (req, res) => {
  const { id } = req.params;
  const { name, category, targetAmount, savedAmount, monthsLeft } = req.body;
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

  if (!Number.isInteger(monthsLeft) || monthsLeft <= 0) {
    return res.status(400).json({
      success: false,
      message: "Months to reach goal must be a positive whole number.",
    });
  }

  const targetDate = new Date();
  targetDate.setMonth(targetDate.getMonth() + monthsLeft);
  const monthlyRequired = Math.round((targetAmount / monthsLeft) * 100) / 100;
  const status = savedAmount >= targetAmount ? "completed" : "active";

  try {
    const result = await pool.query(
      `UPDATE goals
       SET name = $1, category = $2, target_amount = $3, target_date = $4,
           monthly_required = $5, saved_amount = $6, status = $7
       WHERE goal_id = $8 AND user_id = $9
       RETURNING *`,
      [
        name,
        category,
        targetAmount,
        targetDate,
        monthlyRequired,
        savedAmount,
        status,
        id,
        userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Goal not found.",
      });
    }

    res.status(200).json({
      success: true,
      goal: mapGoal(result.rows[0], monthsLeft),
    });
  } catch (err) {
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
