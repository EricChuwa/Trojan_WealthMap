import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

type Tab = "overview" | "transactions";
type Category = "Need" | "Want" | "Saving";

const categoryColor: Record<Category, string> = {
  Need: "var(--color-emerald-light)",
  Want: "var(--color-gold-light)",
  Saving: "var(--color-sapphire)",
};

const groups = [
  {
    name: "Essentials",
    category: "Need" as Category,
    spent: 24500,
    limit: 28000,
    items: [
      { name: "Rent & Utilities", status: "paid", amount: 15000 },
      { name: "Groceries", status: "unpaid", amount: 9500 },
    ],
  },
  {
    name: "Lifestyle",
    category: "Want" as Category,
    spent: 12000,
    limit: 15000,
    items: [{ name: "Dining Out", status: "none", amount: 3000 }],
  },
];

const emergencyFund = { amount: 20000, targetMonths: 73500, pct: 27 };

const transactions = [
  {
    date: "1 Jul",
    item: "Salary",
    sub: "Income · MoMo",
    status: null,
    amount: 85000,
    type: "income" as const,
  },
  {
    date: "3 Jul",
    item: "Electricity",
    sub: "Household · Need",
    status: "paid",
    amount: -12000,
  },
  {
    date: "8 Jul",
    item: "Cleaning service",
    sub: "Household · Need",
    status: "unpaid",
    amount: -8000,
  },
  {
    date: "14 Jul",
    item: "Street food",
    sub: "Weekend trips · Want",
    status: "flagged",
    amount: -3500,
  },
  {
    date: "15 Jul",
    item: "Chopping board",
    sub: "Household · Need",
    status: "none",
    amount: -4500,
  },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: string; text: string; color: string }> = {
    paid: { icon: "✓", text: "allocated · paid", color: "#2A9D8F" },
    unpaid: {
      icon: "◷",
      text: "allocated · unpaid",
      color: "var(--color-gold-light)",
    },
    flagged: { icon: "⚠", text: "not allocated · paid", color: "#f87171" },
    none: {
      icon: "○",
      text: "not allocated",
      color: "var(--color-text-muted)",
    },
  };
  const s = map[status];
  return (
    <span
      className="text-xs flex items-center gap-1"
      style={{ color: s.color }}
    >
      <span>{s.icon}</span> {s.text}
    </span>
  );
}

export default function Budget() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["overview", "transactions"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm ${
                tab === t
                  ? "bg-[var(--color-gold-light)]/15 text-[var(--color-gold-light)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {t === "overview" ? "Overview" : "All Transactions"}
            </button>
          ))}
        </div>

        <div className="bg-[#131313] border border-[#232323] rounded-3xl p-10">
          {tab === "overview" ? (
            <div className="grid grid-cols-[1fr_360px] gap-10">
              {/* Left column */}
              <div>
                {/* Hero */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-5xl">RWF 65,000</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      spendable
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Real RWF 85,000
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-gold-light)]">
                      RWF 20,000 protected
                    </span>
                  </div>
                </div>

                {/* In/Out band */}
                <div className="flex items-center gap-10 py-6 border-y border-[var(--color-border)] mb-8">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">
                      ↑ IN
                    </p>
                    <p className="font-mono text-xl">85,000</p>
                  </div>
                  <div className="w-px h-10 bg-[var(--color-border)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">
                      ↓ OUT
                    </p>
                    <p className="font-mono text-xl">41,500</p>
                  </div>
                </div>

                {/* Priority banner — matches Dashboard's Priority Action pattern exactly */}
                <div className="border-l-2 border-[var(--color-gold-light)] pl-4 py-2 mb-8">
                  <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-2">
                    Priority this payday
                  </p>
                  <p className="font-[family-name:var(--font-display)] text-lg">
                    Your Emergency Fund covers less than one month of
                    essentials. A 3-month buffer would be{" "}
                    <span className="text-[var(--color-gold-light)]">
                      RWF {emergencyFund.targetMonths.toLocaleString()}
                    </span>{" "}
                    — you're{" "}
                    <span className="text-[var(--color-gold-light)]">
                      {emergencyFund.pct}%
                    </span>{" "}
                    there.
                  </p>
                </div>

                {/* Groups */}
                <div className="space-y-4">
                  {groups.map((g) => (
                    <div
                      key={g.name}
                      className="bg-[var(--color-card)] rounded-xl p-5 border-l-2"
                      style={{ borderColor: categoryColor[g.category] }}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <p className="font-[family-name:var(--font-display)] text-lg">
                            {g.name}
                          </p>
                          <span
                            className="text-[10px] uppercase px-2 py-0.5 rounded-full"
                            style={{
                              color: categoryColor[g.category],
                              border: `1px solid ${categoryColor[g.category]}55`,
                            }}
                          >
                            {g.category}
                          </span>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-text-muted)]">
                          {g.spent.toLocaleString()} /{" "}
                          {g.limit.toLocaleString()}
                        </p>
                      </div>
                      {g.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{item.name}</p>
                            <StatusBadge status={item.status} />
                          </div>
                          <p className="font-mono text-sm">
                            RWF {item.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                      {g.category === "Saving" && (
                        <button className="text-xs text-[var(--color-gold-light)] mt-2">
                          + Link to a goal
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Emergency Fund */}
                  <div className="bg-[var(--color-card)] rounded-xl p-5 border-l-2 border-[var(--color-sapphire)]">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="var(--color-gold-light)"
                          strokeWidth="2"
                        >
                          <rect x="5" y="11" width="14" height="9" rx="1.5" />
                          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                        </svg>
                        <p className="font-[family-name:var(--font-display)] text-lg">
                          Emergency Fund
                        </p>
                        <span className="text-[10px] uppercase px-2 py-0.5 rounded-full text-[var(--color-gold-light)] border border-[var(--color-gold-light)]/40">
                          Saving · protected
                        </span>
                      </div>
                      <p className="font-mono text-sm text-[var(--color-gold-light)]">
                        RWF {emergencyFund.amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-1 bg-[#252525] rounded-full overflow-hidden w-40">
                      <div
                        className="h-full bg-[var(--color-gold-light)] rounded-full"
                        style={{ width: `${emergencyFund.pct}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                      {emergencyFund.pct}% of 3-month target
                    </p>
                  </div>
                </div>
              </div>

              {/* Manage budgets panel */}
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl mb-6">
                  Manage budgets
                </p>
                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  Group Name
                </label>
                <input
                  placeholder="e.g. Subscription Services"
                  className="w-full bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 mt-2 mb-5 text-sm placeholder:text-[var(--color-text-muted)]"
                />
                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  Category
                </label>
                <div className="flex gap-2 mt-2 mb-5">
                  {(["Need", "Want", "Saving"] as Category[]).map((c) => (
                    <button
                      key={c}
                      className="px-3 py-1.5 rounded-full text-xs border"
                      style={{
                        borderColor: categoryColor[c],
                        color: categoryColor[c],
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                    Items
                  </label>
                  <button className="text-xs text-[var(--color-gold-light)]">
                    + Add item
                  </button>
                </div>
                <div className="flex justify-between items-center bg-[var(--color-obsidian)] rounded-lg px-3 py-2 mb-6 text-sm">
                  <span>Netflix</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono">8,500</span>
                    <span className="text-[var(--color-text-muted)] cursor-pointer">
                      ×
                    </span>
                  </div>
                </div>
                <button className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] font-medium text-sm">
                  Save changes
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-10 mb-8">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Income · July
                  </p>
                  <p className="font-mono text-3xl text-[#2A9D8F]">+85,000</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Expenses · July
                  </p>
                  <p className="font-mono text-3xl text-red-400">-41,500</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Net
                  </p>
                  <p className="font-mono text-3xl">+43,500</p>
                </div>
              </div>

              {/* Table */}
              <div className="grid grid-cols-[80px_1fr_180px_120px] text-xs uppercase text-[var(--color-text-muted)] pb-3 border-b border-[var(--color-border)]">
                <span>Date</span>
                <span>Item</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>
              {transactions.map((t) => (
                <div
                  key={t.item}
                  className="grid grid-cols-[80px_1fr_180px_120px] items-center py-4 border-b border-[var(--color-border)]"
                >
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {t.date}
                  </span>
                  <div>
                    <p className="text-sm">{t.item}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t.sub}
                    </p>
                  </div>
                  <span>{t.status && <StatusBadge status={t.status} />}</span>
                  <span
                    className={`font-mono text-right ${
                      t.type === "income" ? "text-[#2A9D8F]" : "text-red-400"
                    }`}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {t.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
