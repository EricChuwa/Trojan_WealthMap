const pool = require("../config/db");

// GET /api/dashboard

const getDashboard = async (req, res) => {
  const userId = req.user.id;
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const [userRes, budgetRes, txnRes, healthRes, goalsRes, investRes] =
      await Promise.all([
        pool.query(
          `SELECT first_name, last_name, country, currency
             FROM users WHERE users_id = $1`,
          [userId],
        ),
        pool.query(
          `SELECT income, savings_alloc FROM budgets
            WHERE user_id = $1 AND month = $2`,
          [userId, month],
        ),
        pool.query(
          `SELECT
             COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)  AS money_in,
             COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS money_out
             FROM transactions
            WHERE user_id = $1 AND to_char(txn_date, 'YYYY-MM') = $2`,
          [userId, month],
        ),
        pool.query(
          `SELECT overall_score, budget_score, goals_score,
                  literacy_score, activity_score, streak_days, snapshot_date
             FROM health_snapshots
            WHERE user_id = $1
            ORDER BY snapshot_date DESC LIMIT 1`,
          [userId],
        ),
        pool.query(
          `SELECT goal_id, name, category, target_amount, current_amount,
                  target_date, monthly_required
             FROM goals
            WHERE user_id = $1 AND status = 'active'
            ORDER BY target_date NULLS LAST LIMIT 3`,
          [userId],
        ),
        pool.query(
          `SELECT o.option_id, o.name, o.risk_level, o.min_amount, o.expected_return
             FROM investment_options o
            WHERE o.is_active = TRUE
              AND (o.country IS NULL OR o.country = (
                    SELECT country FROM users WHERE users_id = $1))
            ORDER BY o.expected_return DESC NULLS LAST LIMIT 2`,
          [userId],
        ),
      ]);

    const user = userRes.rows[0] || null;
    const budget = budgetRes.rows[0] || null;
    const moneyIn = Number(txnRes.rows[0].money_in);
    const moneyOut = Number(txnRes.rows[0].money_out);
    const health = healthRes.rows[0] || null;

    const goals = goalsRes.rows.map((g) => {
      const target = Number(g.target_amount);
      const current = Number(g.current_amount || 0);
      const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

      let monthsLeft = null;
      if (g.target_date) {
        const t = new Date(g.target_date);
        monthsLeft = Math.max(
          0,
          (t.getFullYear() - now.getFullYear()) * 12 + (t.getMonth() - now.getMonth()),
        );
      }

      return {
        goal_id: g.goal_id,
        name: g.name,
        category: g.category,
        target_amount: target,
        current_amount: current,
        pct,
        months_left: monthsLeft,
        monthly_required: g.monthly_required ? Number(g.monthly_required) : null,
      };
    });

    res.status(200).json({
      success: true,
      month,
      user: user
        ? {
            first_name: user.first_name,
            last_name: user.last_name,
            country: user.country,
            currency: user.currency || "RWF",
          }
        : null,
      money: {
        income: budget ? Number(budget.income) : moneyIn,
        spent: moneyOut,
        money_in: moneyIn,
        protected: budget ? Number(budget.savings_alloc) : 0,
      },
      health: health
        ? {
            overall_score: health.overall_score,
            budget_score: health.budget_score,
            goals_score: health.goals_score,
            literacy_score: health.literacy_score,
            activity_score: health.activity_score,
            streak_days: health.streak_days,
            snapshot_date: health.snapshot_date,
          }
        : null,
      goals,
      investments: investRes.rows.map((o) => ({
        option_id: o.option_id,
        name: o.name,
        risk_level: o.risk_level,
        min_amount: o.min_amount ? Number(o.min_amount) : null,
        expected_return: o.expected_return ? Number(o.expected_return) : null,
      })),
    });
  } catch (err) {
    console.error("Get dashboard error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = { getDashboard };