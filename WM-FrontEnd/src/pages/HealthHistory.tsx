import { useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import Navbar from "../components/Navbar";

const chartData = [
  { date: "Oct 01", score: 60 },
  { date: "Oct 08", score: 68 },
  { date: "Oct 15", score: 74 },
  { date: "Oct 22", score: 63 },
  { date: "Oct 29", score: 72 },
];

const journalEntries = [
  {
    date: "Oct 28",
    text: (
      <>
        Completed{" "}
        <span className="italic text-[var(--color-gold-light)]">
          "Staying Safe"
        </span>{" "}
        lesson — literacy score up 4 points
      </>
    ),
    delta: "+4.8",
    color: "text-[#2A9D8F]",
  },
  {
    date: "Oct 26",
    text: "Exceeded monthly dining budget cap by RWF 14,200",
    delta: "-1.2",
    color: "text-red-400",
  },
  {
    date: "Oct 22",
    text: (
      <>
        Auto-transfer to <span className="italic">Dream Home Fund</span>{" "}
        executed
      </>
    ),
    delta: "···",
    color: "text-[var(--color-text-muted)]",
  },
  {
    date: "Oct 19",
    text: "Achieved 7-Day Savings Streak. Bonus multiplier applied.",
    delta: "+2.5",
    color: "text-[#2A9D8F]",
  },
  {
    date: "Oct 15",
    text: "Quarterly financial check-up completed. No adjustments needed.",
    delta: "+0.8",
    color: "text-[#2A9D8F]",
  },
];

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

export default function HealthHistory() {
  const [range, setRange] = useState<"Week" | "Month" | "Year">("Month");

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

        {/* Hero: two columns */}
        <div className="grid grid-cols-2 gap-6 mb-10">
          {/* Rings */}
          <div className="bg-[var(--color-card)] rounded-2xl p-8 flex flex-col items-center">
            <svg width="260" height="260" viewBox="0 0 260 260">
              <Ring radius={115} percent={84} color="#2D7A5F" />
              <Ring radius={95} percent={62} color="#D4A017" />
              <Ring radius={75} percent={91} color="#2A9D8F" />
              <text
                x="130"
                y="122"
                textAnchor="middle"
                className="font-[family-name:var(--font-display)]"
                fontSize="52"
                fill="url(#scoreGradient)"
              >
                72
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
                <span className="font-mono ml-1">84%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#D4A017]" /> Goals{" "}
                <span className="font-mono ml-1">62%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2A9D8F]" /> Literacy{" "}
                <span className="font-mono ml-1">91%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-sapphire)]" />{" "}
                Streak <span className="font-mono ml-1">14d</span>
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

            <div className="flex gap-10 mt-2">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Average monthly
                </p>
                <p className="font-mono text-[var(--color-gold-light)]">68.4</p>
              </div>
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  Top milestone
                </p>
                <p className="font-mono">74.2</p>
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
                October 2026
              </p>
            </div>
            {[
              {
                name: "Budget Adherence",
                sub: "You stayed within your set entertainment limits for 3 weeks straight.",
                pct: "84%",
                ring: "#2D7A5F",
              },
              {
                name: "Goal Momentum",
                sub: "Emerald fund is 12% away from the monthly milestone.",
                pct: "62%",
                ring: "#D4A017",
              },
              {
                name: "Literacy Score",
                sub: 'Completed 4 modules in "Market Volatility" this period.',
                pct: "91%",
                ring: "#2A9D8F",
              },
            ].map((item) => (
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
                      2 * Math.PI * 15 * (1 - parseInt(item.pct) / 100)
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
                  {item.pct}
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
            {journalEntries.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-4 py-3 border-b border-[var(--color-border)] text-sm"
              >
                <p className="font-mono text-xs text-[var(--color-text-muted)] w-14 pt-0.5">
                  {entry.date}
                </p>
                <p className="flex-1 text-[var(--color-text-secondary)]">
                  {entry.text}
                </p>
                <p className={`font-mono text-xs ${entry.color}`}>
                  {entry.delta}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
