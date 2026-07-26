import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";
import { getHealthHistory, type HealthHistoryData } from "../api/flow";

function Ring({
  radius,
  percent,
  color,
  strokeWidth = 8,
}: {
  radius: number;
  percent: number;
  color: string;
  strokeWidth?: number;
}) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <>
      <circle
        cx="130"
        cy="130"
        r={radius}
        stroke={color}
        strokeOpacity={0.15}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        cx="130"
        cy="130"
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 130 130)"
      />
    </>
  );
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function deltaColor(delta: number | null): string {
  if (delta === null) return "text-[var(--color-text-muted)]";
  if (delta > 0) return "text-[#2A9D8F]";
  if (delta < 0) return "text-red-400";
  return "text-[var(--color-text-muted)]";
}

function deltaLabel(delta: number | null): string {
  if (delta === null) return "···";
  return delta > 0 ? `+${delta}` : `${delta}`;
}

const RANGE_MAP = { Week: "week", Month: "month", Year: "year" } as const;

export default function HealthHistory() {
  const navigate = useNavigate();
  const [range, setRange] = useState<"Week" | "Month" | "Year">("Month");
  const [data, setData] = useState<HealthHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    getHealthHistory(RANGE_MAP[range])
      .then(setData)
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Could not load health history";
        setError(message);
        if (message.toLowerCase().includes("session")) navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [range, navigate]);

  const h = data?.latest;
  const overall = h?.overall_score ?? 0;
  const budget = h?.budget_score ?? 0;
  const goals = h?.goals_score ?? 0;
  const literacy = h?.literacy_score ?? 0;
  const streak = h?.streak_days ?? 0;

  const chartData =
    data?.history.map((point) => ({
      date: shortDate(point.date),
      score: point.score ?? 0,
    })) ?? [];

  const breakdown = [
    {
      name: "Budget Adherence",
      sub: "How consistently you stay within your set spending limits.",
      pct: budget,
      ring: "#2D7A5F",
    },
    {
      name: "Goal Momentum",
      sub: "Progress toward your active savings and investment goals.",
      pct: goals,
      ring: "#D4A017",
    },
    {
      name: "Literacy Score",
      sub: "Lessons completed and quizzes passed in Learn.",
      pct: literacy,
      ring: "#2A9D8F",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-8">
          <Link
            to="/dashboard"
            className="hover:text-[var(--color-text-primary)]"
          >
            ←
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-[var(--color-text-primary)]"
          >
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-[var(--color-gold-light)]">
            Financial Health
          </span>
        </div>

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Hero: two columns */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Rings */}
          <div className="bg-[var(--color-card)] rounded-2xl p-8 flex flex-col items-center">
            <svg width="260" height="260" viewBox="0 0 260 260">
              <Ring radius={115} percent={budget} color="#2D7A5F" />
              <Ring radius={95} percent={goals} color="#D4A017" />
              <Ring radius={75} percent={literacy} color="#2A9D8F" />
              <text
                x="130"
                y="122"
                textAnchor="middle"
                className="font-[family-name:var(--font-display)]"
                fontSize="52"
                fill="url(#scoreGradient)"
              >
                {loading ? "—" : overall}
              </text>
              <text
                x="130"
                y="148"
                textAnchor="middle"
                fontSize="10"
                letterSpacing="2"
                fill="var(--color-text-muted)"
              >
                FINANCIAL HEALTH
              </text>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5F3EF" />
                  <stop offset="100%" stopColor="#D4A017" />
                </linearGradient>
              </defs>
            </svg>
            <div className="grid grid-cols-2 gap-x-10 gap-y-2 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2D7A5F]" /> Budget{" "}
                <span className="font-mono ml-1">{budget}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" /> Goals{" "}
                <span className="font-mono ml-1">{goals}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" /> Literacy{" "}
                <span className="font-mono ml-1">{literacy}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-sapphire)]" />{" "}
                Streak <span className="font-mono ml-1">{streak}d</span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-[var(--color-card)] rounded-2xl p-8">
            <div className="flex justify-between items-center mb-4">
              <p className="font-[family-name:var(--font-display)] text-xl">
                Score History
              </p>
              <div className="flex bg-[var(--color-obsidian)] rounded-full p-1 text-xs">
                {(["Week", "Month", "Year"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`px-4 py-1.5 rounded-full ${range === r ? "bg-[var(--color-gold-light)] text-[var(--color-obsidian)]" : "text-[var(--color-text-muted)]"}`}
                  >
                    {r.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  No score history for this range yet.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A017" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#D4A017" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#9A9A9A"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Area
                    type="basis"
                    dataKey="score"
                    stroke="#D4A017"
                    strokeWidth={2.5}
                    fill="url(#scoreFill)"
                    dot={{ fill: "#D4A017", r: 4, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            <div className="flex gap-10 mt-2">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Average {range.toLowerCase()}
                </p>
                <p className="font-mono text-[var(--color-gold-light)]">
                  {data?.stats.average ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Top milestone
                </p>
                <p className="font-mono">{data?.stats.peak ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lower: two columns */}
        <div className="grid grid-cols-2 gap-6">
          {/* Breakdown */}
          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[family-name:var(--font-display)] text-2xl">
                Breakdown
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                {h ? shortDate(h.snapshot_date) : "—"}
              </p>
            </div>
            {breakdown.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-4 py-4 border-b border-[var(--color-border)]"
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  className="flex-shrink-0"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke={item.ring}
                    strokeOpacity={0.15}
                    strokeWidth={3}
                    fill="none"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke={item.ring}
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={
                      2 * Math.PI * 15 * (1 - item.pct / 100)
                    }
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <div className="flex-1">
                  <p className="font-[family-name:var(--font-display)] text-base">
                    {item.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.sub}
                  </p>
                </div>
                <p className="font-mono" style={{ color: item.ring }}>
                  {item.pct}%
                </p>
              </div>
            ))}
          </div>

          {/* Journal */}
          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[family-name:var(--font-display)] text-2xl">
                Activity Journal
              </p>
              <p className="text-xs text-[var(--color-gold-light)]">
                See all entries
              </p>
            </div>

            {!loading && (data?.journal.length ?? 0) === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] py-3">
                No activity recorded yet. Your journal fills in as you use the
                app.
              </p>
            )}

            {data?.journal.map((entry) => (
              <div
                key={entry.activity_id}
                className="flex items-start gap-4 py-3 border-b border-[var(--color-border)] text-sm"
              >
                <p className="font-mono text-xs text-[var(--color-text-muted)] w-14 pt-0.5">
                  {shortDate(entry.date)}
                </p>
                <p className="flex-1 text-[var(--color-text-secondary)]">
                  {entry.description}
                </p>
                <p className={`font-mono text-xs ${deltaColor(entry.score_delta)}`}>
                  {deltaLabel(entry.score_delta)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}