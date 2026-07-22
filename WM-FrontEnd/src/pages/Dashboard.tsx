import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { getDashboard, type DashboardData } from "../api/flow";

function money(n: number): string {
  return n.toLocaleString("en-RW");
}

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const goalColors = [
  "text-[#2A9D8F]",
  "text-[var(--color-gold-light)]",
  "text-[var(--color-text-muted)]",
];

const investStyles = [
  "bg-gradient-to-br from-[var(--color-emerald-light)] to-[#0F2A21]",
  "bg-gradient-to-br from-[var(--color-sapphire)] to-[#0C1E3D]",
];

// Points the nudge at whichever sub-score is genuinely lowest.
function weakestArea(health: DashboardData["health"]): string | null {
  if (!health) return null;
  const areas = [
    { label: "literacy", score: health.literacy_score },
    { label: "budget", score: health.budget_score },
    { label: "goals", score: health.goals_score },
    { label: "activity", score: health.activity_score },
  ].filter((a) => a.score !== null) as { label: string; score: number }[];
  if (areas.length === 0) return null;
  return areas.sort((a, b) => a.score - b.score)[0].label;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Could not load dashboard";
        setError(message);
        if (message.toLowerCase().includes("session")) navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const weak = weakestArea(data?.health ?? null);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        {/* Faint accent glow */}
        <div className="absolute -top-10 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--color-emerald-light)] to-[var(--color-gold)] opacity-10 blur-3xl pointer-events-none" />

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 mb-6 relative z-10">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Hero: two columns */}
        <div className="grid grid-cols-2 gap-6 relative z-10 mb-10">
          <Link
            to="/health-history"
            className="block bg-[var(--color-card)] rounded-2xl p-8 hover:bg-[var(--color-card)]/80 transition-colors cursor-pointer"
          >
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              {greeting()},{" "}
              <span className="text-[var(--color-text-primary)]">
                {data?.user?.first_name ?? "there"}
              </span>
            </p>
            <div className="font-[family-name:var(--font-display)] text-7xl bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-gold-light)] bg-clip-text text-transparent">
              {loading || !data?.health ? (
                <span className="text-[var(--color-text-muted)] bg-none">—</span>
              ) : (
                data.health.overall_score
              )}
            </div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mt-1 mb-4">
              Financial health
            </p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              {data?.health
                ? weak
                  ? `Your ${weak} score is your lowest area — one lesson today would move the needle.`
                  : "Your financial health is tracking steadily."
                : "No health score yet — it builds as you use WealthMap."}
            </p>
          </Link>

          <div className="flex flex-col gap-6">
            <div className="bg-[var(--color-card)] rounded-2xl p-6">
              <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                This month
              </p>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Income
                  </p>
                  <p className="font-mono text-xl">
                    RWF {money(data?.money.income ?? 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Spent
                  </p>
                  <p className="font-mono text-xl text-[var(--color-gold-light)]">
                    RWF {money(data?.money.spent ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-2xl p-6 border-l-2 border-[var(--color-gold-light)]">
              <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-2">
                Priority today
              </p>
              {!data || data.money.income === 0 ? (
                <>
                  <p className="font-[family-name:var(--font-display)] text-lg mb-2">
                    No income recorded yet — set up your{" "}
                    <span className="text-[#2A9D8F]">Flow</span> to start
                    tracking.
                  </p>
                  <Link
                    to="/budget"
                    className="text-xs text-[var(--color-gold-light)]"
                  >
                    Open Flow →
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-[family-name:var(--font-display)] text-lg mb-2">
                    Complete <span className="text-[#2A9D8F]">"Staying Safe"</span>{" "}
                    — your Learn score is {data?.health?.literacy_score ?? 0}%.
                  </p>
                  <Link
                    to="/learn"
                    className="text-xs text-[var(--color-gold-light)]"
                  >
                    Start lesson →
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lower: goals + investment roadmap */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[family-name:var(--font-display)] text-2xl">
                Goals
              </p>
              <Link to="/goals" className="text-xs text-[var(--color-text-muted)]">
                See all
              </Link>
            </div>

            {!loading && (data?.goals.length ?? 0) === 0 && (
              <div className="bg-[var(--color-card)] rounded-xl p-5 text-center">
                <p className="text-sm text-[var(--color-text-muted)] mb-2">
                  No goals set yet.
                </p>
                <Link to="/goals" className="text-xs text-[var(--color-gold-light)]">
                  Set your first goal →
                </Link>
              </div>
            )}

            {data?.goals.map((goal, i) => (
              <Link
                to="/goals"
                key={goal.goal_id}
                className="block bg-[var(--color-card)] rounded-xl p-5 mb-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-[family-name:var(--font-display)] text-lg">
                    {goal.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {goal.months_left !== null
                      ? `${goal.months_left} month${goal.months_left === 1 ? "" : "s"} left`
                      : "No target date"}
                  </p>
                </div>
                <p className={`font-mono text-xl ${goalColors[i % goalColors.length]}`}>
                  {goal.pct}%
                </p>
              </Link>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[family-name:var(--font-display)] text-2xl">
                Investment roadmap
              </p>
              <Link to="/invest" className="text-xs text-[var(--color-text-muted)]">
                See all
              </Link>
            </div>

            {!loading && (data?.investments.length ?? 0) === 0 && (
              <div className="bg-[var(--color-card)] rounded-xl p-6 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No investment options available yet.
                </p>
              </div>
            )}

            {data?.investments.map((opt, i) => (
              <Link
                to={`/invest/${opt.option_id}`}
                key={opt.option_id}
                className={`block rounded-xl p-6 mb-3 ${investStyles[i % investStyles.length]}`}
              >
                <p className="font-[family-name:var(--font-display)] text-lg">
                  {opt.name}
                </p>
                <p className="text-xs opacity-80 mb-6">
                  {opt.expected_return !== null
                    ? `~${opt.expected_return}%/yr return`
                    : `${opt.risk_level} risk`}
                </p>
                <div className="flex justify-between items-end">
                  <p className="font-mono text-xs opacity-80">
                    {opt.min_amount !== null
                      ? `Min. RWF ${money(opt.min_amount)}`
                      : "No minimum"}
                  </p>
                  <p className="font-mono text-xs opacity-80 uppercase">
                    {opt.risk_level} risk
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}