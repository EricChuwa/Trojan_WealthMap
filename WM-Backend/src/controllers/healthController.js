const pool = require("../config/db");

const RANGE_DAYS = { week: 7, month: 30, year: 365 };

// GET /api/health?range=week|month|year
// Everything the Financial Health page needs: the latest snapshot (rings +
// breakdown), the score history for the chart, chart summary stats, and the
// activity journal. Empty account returns nulls/empties, not an error.
const getHealthHistory = async (req, res) => {
  const userId = req.user.id;
  const range = ["week", "month", "year"].includes(req.query.range)
    ? req.query.range
    : "month";
  const days = RANGE_DAYS[range];

  try {
    const [latestRes, historyRes, journalRes] = await Promise.all([
      pool.query(
        `SELECT overall_score, budget_score, goals_score,
                literacy_score, activity_score, streak_days, snapshot_date
           FROM health_snapshots
          WHERE user_id = $1
          ORDER BY snapshot_date DESC LIMIT 1`,
        [userId],
      ),
      pool.query(
        `SELECT snapshot_date, overall_score
           FROM health_snapshots
          WHERE user_id = $1
            AND snapshot_date >= CURRENT_DATE - ($2 || ' days')::interval
          ORDER BY snapshot_date ASC`,
        [userId, days],
      ),
      pool.query(
        `SELECT activity_id, event_date, description, category, score_delta
           FROM activity_log
          WHERE user_id = $1
          ORDER BY event_date DESC, created_at DESC
          LIMIT 20`,
        [userId],
      ),
    ]);

    const latest = latestRes.rows[0] || null;

    const history = historyRes.rows.map((r) => ({
      date: r.snapshot_date,
      score: r.overall_score,
    }));

    // Chart summary stats, guarded against an empty series.
    const scores = history.map((h) => h.score).filter((s) => s !== null);
    const average =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null;
    const peak = scores.length > 0 ? Math.max(...scores) : null;

    const journal = journalRes.rows.map((r) => ({
      activity_id: r.activity_id,
      date: r.event_date,
      description: r.description,
      category: r.category,
      score_delta: r.score_delta === null ? null : Number(r.score_delta),
    }));

    res.status(200).json({
      success: true,
      range,
      latest: latest
        ? {
            overall_score: latest.overall_score,
            budget_score: latest.budget_score,
            goals_score: latest.goals_score,
            literacy_score: latest.literacy_score,
            activity_score: latest.activity_score,
            streak_days: latest.streak_days,
            snapshot_date: latest.snapshot_date,
          }
        : null,
      history,
      stats: { average, peak },
      journal,
    });
  } catch (err) {
    console.error("Get health history error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = { getHealthHistory };