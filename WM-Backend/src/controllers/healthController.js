const pool = require("../config/db");
const { computeHealthScore } = require("../services/healthScore");

const RANGE_DAYS = { week: 7, month: 30, year: 365 };

// GET /api/health?range=week|month|year
// The "latest" score is computed live from the user's real budget, goals,
// lessons, and transactions — it does not depend on health_snapshots being
// populated. The history chart still reads stored snapshots (so a trend line
// appears once snapshots start being written), and the journal reads
// activity_log. Everything degrades to a sensible baseline on a fresh account.
const getHealthHistory = async (req, res) => {
  const userId = req.user.id;
  const range = ["week", "month", "year"].includes(req.query.range)
    ? req.query.range
    : "month";
  const days = RANGE_DAYS[range];

  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    const [live, historyRes, journalRes] = await Promise.all([
      computeHealthScore(userId, month),
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

    // History = stored snapshots, plus today's live score appended so the
    // chart always has at least one real point.
    const history = historyRes.rows.map((r) => ({
      date: r.snapshot_date,
      score: r.overall_score,
    }));
    const todayKey = now.toISOString().slice(0, 10);
    const lastStored = history[history.length - 1];
    if (!lastStored || String(lastStored.date).slice(0, 10) !== todayKey) {
      history.push({ date: todayKey, score: live.overall_score });
    }

    const scores = history.map((h) => h.score).filter((s) => s !== null);
    const average =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : live.overall_score;
    const peak = scores.length > 0 ? Math.max(...scores) : live.overall_score;

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
      // Live-computed current score — always present, never null.
      latest: {
        overall_score: live.overall_score,
        budget_score: live.budget_score,
        goals_score: live.goals_score,
        literacy_score: live.literacy_score,
        activity_score: live.activity_score,
        streak_days: live.streak_days,
        snapshot_date: todayKey,
        is_live: true,
      },
      has_activity: live.has_any_data,
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