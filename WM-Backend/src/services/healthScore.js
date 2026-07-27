const pool = require("../config/db");

// Computes a user's financial-health score live from data that already exists
// in the database — no health_snapshots row required. Each sub-score is 0-100
// and independently explainable; the overall is their weighted blend.
//
// Sub-scores:
//   budget   — are they spending within what they planned this month?
//   goals    — average progress across active goals
//   literacy — share of lessons completed in Learn
//   activity — recent engagement (transactions logged in the last 30 days)
//
// Any dimension with no data yet contributes a neutral baseline rather than
// dragging the whole score to zero, so a partly-onboarded user still gets a
// sensible number.

const WEIGHTS = { budget: 0.3, goals: 0.3, literacy: 0.25, activity: 0.15 };
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

async function computeBudgetScore(userId, month) {
  // Planned vs. actually spent this month. Spending at or under plan = 100;
  // going over scales the score down. No plan yet = neutral 50.
  // Separate subqueries so joining items and transactions doesn't multiply rows.
  const res = await pool.query(
    `SELECT
       (SELECT COALESCE(SUM(i.planned_amount), 0)
          FROM expense_items i
          JOIN budgets b ON b.budget_id = i.budget_id
         WHERE b.user_id = $1 AND b.month = $2) AS planned,
       (SELECT COALESCE(SUM(t.amount), 0)
          FROM transactions t
          JOIN budgets b ON b.budget_id = t.budget_id
         WHERE b.user_id = $1 AND b.month = $2 AND t.type = 'expense') AS spent`,
    [userId, month],
  );

  const planned = Number(res.rows[0].planned);
  const spent = Number(res.rows[0].spent);

  if (planned === 0) return { score: 50, planned, spent, hasData: false };
  if (spent <= planned) return { score: 100, planned, spent, hasData: true };

  // Over budget: lose points proportional to the overspend, floor at 0.
  const overRatio = (spent - planned) / planned;
  return { score: clamp(100 - overRatio * 100), planned, spent, hasData: true };
}

async function computeGoalsScore(userId) {
  const res = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COALESCE(AVG(
         CASE WHEN target_amount > 0
              THEN LEAST(1, saved_amount / target_amount)
              ELSE 0 END
       ), 0) AS avg_progress    
       FROM goals
      WHERE user_id = $1 AND status = 'active'`,
    [userId],
  );

  const total = Number(res.rows[0].total);
  if (total === 0) return { score: 50, total, hasData: false };

  return {
    score: clamp(Number(res.rows[0].avg_progress) * 100),
    total,
    hasData: true,
  };
}

async function computeLiteracyScore(userId) {
  // Share of the lesson catalogue the user has completed.
  const res = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM lessons) AS total_lessons,
       (SELECT COUNT(*) FROM user_lesson_progress
         WHERE user_id = $1 AND status = 'completed') AS completed`,
    [userId],
  );

  const total = Number(res.rows[0].total_lessons);
  const completed = Number(res.rows[0].completed);
  if (total === 0) return { score: 50, completed, total, hasData: false };

  return {
    score: clamp((completed / total) * 100),
    completed,
    total,
    hasData: completed > 0,
  };
}

async function computeActivityScore(userId) {
  // Engagement: transactions logged in the last 30 days. Caps at ~12/month
  // (roughly one every few days) counting as fully active.
  const res = await pool.query(
    `SELECT COUNT(*) AS recent
       FROM transactions
      WHERE user_id = $1
        AND txn_date >= CURRENT_DATE - INTERVAL '30 days'`,
    [userId],
  );

  const recent = Number(res.rows[0].recent);
  if (recent === 0) return { score: 30, recent, hasData: false };

  return { score: clamp((recent / 12) * 100), recent, hasData: true };
}

// Best-effort streak: consecutive days (ending today or yesterday) with at
// least one transaction. Cheap approximation, good enough for the badge.
async function computeStreak(userId) {
  const res = await pool.query(
    `SELECT DISTINCT txn_date
       FROM transactions
      WHERE user_id = $1
        AND txn_date >= CURRENT_DATE - INTERVAL '60 days'
      ORDER BY txn_date DESC`,
    [userId],
  );

  const dates = res.rows.map((r) => new Date(r.txn_date).toISOString().slice(0, 10));
  if (dates.length === 0) return 0;

  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (dates.includes(key)) {
      streak++;
    } else if (i === 0) {
      // allow the streak to still count if they've logged something yesterday
      continue;
    } else {
      break;
    }
  }
  return streak;
}

// Returns the full live snapshot the health page needs.
async function computeHealthScore(userId, month) {
  const [budget, goals, literacy, activity, streak] = await Promise.all([
    computeBudgetScore(userId, month),
    computeGoalsScore(userId),
    computeLiteracyScore(userId),
    computeActivityScore(userId),
    computeStreak(userId),
  ]);

  const overall = clamp(
    budget.score * WEIGHTS.budget +
      goals.score * WEIGHTS.goals +
      literacy.score * WEIGHTS.literacy +
      activity.score * WEIGHTS.activity,
  );

  // True only if the user has done *something* real in at least one dimension.
  const hasAnyData =
    budget.hasData || goals.hasData || literacy.hasData || activity.hasData;

  return {
    overall_score: overall,
    budget_score: budget.score,
    goals_score: goals.score,
    literacy_score: literacy.score,
    activity_score: activity.score,
    streak_days: streak,
    has_any_data: hasAnyData,
    detail: { budget, goals, literacy, activity },
  };
}

module.exports = { computeHealthScore };