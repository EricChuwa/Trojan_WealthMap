import { useState } from "react";
import Navbar from "../components/Navbar";

interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthsLeft: number;
  category: "savings" | "purchase" | "emergency" | "investment";
}

const initialGoals: Goal[] = [
  {
    id: 1,
    name: "Emergency Fund",
    targetAmount: 1_500_000,
    savedAmount: 510_000,
    monthsLeft: 9,
    category: "emergency",
  },
  {
    id: 2,
    name: "MacBook Pro",
    targetAmount: 2_200_000,
    savedAmount: 1_496_000,
    monthsLeft: 6,
    category: "purchase",
  },
  {
    id: 3,
    name: "Travel – Zanzibar",
    targetAmount: 800_000,
    savedAmount: 96_000,
    monthsLeft: 11,
    category: "savings",
  },
  {
    id: 4,
    name: "Investment Seed",
    targetAmount: 500_000,
    savedAmount: 500_000,
    monthsLeft: 0,
    category: "investment",
  },
];

const categoryColors: Record<Goal["category"], string> = {
  emergency: "var(--color-gold-light)",
  purchase: "#2A9D8F",
  savings: "var(--color-emerald-light)",
  investment: "var(--color-sapphire)",
};

const categoryBg: Record<Goal["category"], string> = {
  emergency: "rgba(212,160,23,0.08)",
  purchase: "rgba(42,157,143,0.08)",
  savings: "rgba(45,122,95,0.08)",
  investment: "rgba(27,58,107,0.12)",
};

function fmt(n: number) {
  return "RWF " + n.toLocaleString();
}

function GoalCard({ goal }: { goal: Goal }) {
  const pct = Math.min(
    Math.round((goal.savedAmount / goal.targetAmount) * 100),
    100,
  );
  const accent = categoryColors[goal.category];
  const bg = categoryBg[goal.category];
  const isComplete = pct >= 100;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:brightness-110"
      style={{ background: bg, border: `1px solid ${accent}33` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className="font-[family-name:var(--font-display)] text-xl leading-tight"
            style={{ color: "var(--color-text-primary)" }}
          >
            {goal.name}
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isComplete ? "Completed" : `${goal.monthsLeft} months left`}
          </p>
        </div>
        <span
          className="font-mono text-2xl font-bold"
          style={{ color: accent }}
        >
          {pct}%
        </span>
      </div>

      <div
        className="w-full h-1.5 rounded-full overflow-hidden"
        style={{ background: "var(--color-border)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: accent }}
        />
      </div>

      <div
        className="flex justify-between text-xs"
        style={{ color: "var(--color-text-muted)" }}
      >
        <span className="font-mono">{fmt(goal.savedAmount)}</span>
        <span className="font-mono">{fmt(goal.targetAmount)}</span>
      </div>
    </div>
  );
}

type FilterKey = "all" | Goal["category"];

const filters: { label: string; key: FilterKey }[] = [
  { label: "All", key: "all" },
  { label: "Emergency", key: "emergency" },
  { label: "Purchase", key: "purchase" },
  { label: "Savings", key: "savings" },
  { label: "Investment", key: "investment" },
];

export default function Goals() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [showModal, setShowModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    targetAmount: "",
    monthsLeft: "",
    category: "savings" as Goal["category"],
  });
  const [goals, setGoals] = useState<Goal[]>(initialGoals);

  const filtered =
    activeFilter === "all"
      ? goals
      : goals.filter((g) => g.category === activeFilter);

  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = goals.reduce((s, g) => s + g.savedAmount, 0);
  const overallPct = Math.round((totalSaved / totalTarget) * 100);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const next: Goal = {
      id: Date.now(),
      name: newGoal.name.trim() || "Untitled Goal",
      targetAmount: parseInt(newGoal.targetAmount) || 100_000,
      savedAmount: 0,
      monthsLeft: parseInt(newGoal.monthsLeft) || 12,
      category: newGoal.category,
    };
    setGoals((prev) => [next, ...prev]);
    setNewGoal({
      name: "",
      targetAmount: "",
      monthsLeft: "",
      category: "savings",
    });
    setShowModal(false);
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--color-obsidian)" }}
    >
      <Navbar />

      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        {/* Background glow */}
        <div
          className="absolute -top-10 left-1/2 -translate-x-1/2 w-[600px] h-64 rounded-full pointer-events-none blur-3xl opacity-10"
          style={{
            background:
              "radial-gradient(ellipse, var(--color-gold) 0%, transparent 70%)",
          }}
        />

        {/* Page header */}
        <div className="relative z-10 mb-10 flex items-end justify-between">
          <div>
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Financial Goals
            </p>
            <h1
              className="font-[family-name:var(--font-display)] text-4xl leading-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Your goals,{" "}
              <span style={{ color: "var(--color-gold-light)" }}>
                on track.
              </span>
            </h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
            style={{ background: "var(--color-gold-light)", color: "#0d0d0d" }}
          >
            + New Goal
          </button>
        </div>

        {/* Summary strip */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total target", value: fmt(totalTarget) },
            { label: "Total saved", value: fmt(totalSaved) },
            { label: "Overall progress", value: `${overallPct}%` },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl p-6"
              style={{ background: "var(--color-card)" }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                {stat.label}
              </p>
              <p
                className="font-mono text-2xl font-bold"
                style={{ color: "var(--color-text-primary)" }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Overall progress bar */}
        <div
          className="relative z-10 mb-8 rounded-2xl p-6"
          style={{ background: "var(--color-card)" }}
        >
          <div className="flex justify-between mb-3">
            <p
              className="text-sm font-[family-name:var(--font-display)]"
              style={{ color: "var(--color-text-primary)" }}
            >
              Combined progress across all goals
            </p>
            <span
              className="font-mono text-sm"
              style={{ color: "var(--color-gold-light)" }}
            >
              {overallPct}%
            </span>
          </div>
          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-border)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${overallPct}%`,
                background:
                  "linear-gradient(90deg, var(--color-emerald-light), var(--color-gold-light))",
              }}
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="relative z-10 flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={
                activeFilter === f.key
                  ? { background: "var(--color-gold-light)", color: "#0d0d0d" }
                  : {
                      background: "var(--color-card)",
                      color: "var(--color-text-muted)",
                      border: "1px solid var(--color-border)",
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Goal cards grid */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <p
              className="col-span-full text-center py-16"
              style={{ color: "var(--color-text-muted)" }}
            >
              No goals in this category yet.
            </p>
          ) : (
            filtered.map((goal) => <GoalCard key={goal.id} goal={goal} />)
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl p-8 relative"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p
              className="font-[family-name:var(--font-display)] text-2xl mb-6"
              style={{ color: "var(--color-text-primary)" }}
            >
              New Goal
            </p>

            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Goal name
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="e.g. New Laptop"
                  value={newGoal.name}
                  onChange={(e) =>
                    setNewGoal((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Target amount (RWF)
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none"
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="e.g. 500000"
                  value={newGoal.targetAmount}
                  onChange={(e) =>
                    setNewGoal((p) => ({ ...p, targetAmount: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Months to reach goal
                </label>
                <input
                  type="number"
                  className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none"
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  placeholder="e.g. 12"
                  value={newGoal.monthsLeft}
                  onChange={(e) =>
                    setNewGoal((p) => ({ ...p, monthsLeft: e.target.value }))
                  }
                />
              </div>

              <div>
                <label
                  className="block text-xs uppercase tracking-widest mb-1.5"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Category
                </label>
                <select
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                  style={{
                    background: "#0d0d0d",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-primary)",
                  }}
                  value={newGoal.category}
                  onChange={(e) =>
                    setNewGoal((p) => ({
                      ...p,
                      category: e.target.value as Goal["category"],
                    }))
                  }
                >
                  <option value="savings">Savings</option>
                  <option value="purchase">Purchase</option>
                  <option value="emergency">Emergency</option>
                  <option value="investment">Investment</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
                  style={{
                    background: "transparent",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: "var(--color-gold-light)",
                    color: "#0d0d0d",
                  }}
                >
                  Add Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
