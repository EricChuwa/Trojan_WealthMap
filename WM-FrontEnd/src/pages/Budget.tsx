import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  getFlowMonth,
  getTransactions,
  createGroup,
  createItem,
  currentMonth,
  type FlowMonth,
  type FlowGroup,
  type FlowItem,
  type FlowLedger,
} from "../api/flow";

type Tab = "overview" | "transactions";
type Category = "need" | "want" | "saving";

const categoryColor: Record<Category, string> = {
  need: "var(--color-emerald-light)",
  want: "var(--color-gold-light)",
  saving: "var(--color-sapphire)",
};

const categoryLabel: Record<Category, string> = {
  need: "Need",
  want: "Want",
  saving: "Saving",
};

// The two independent flags collapse into four readable states.
function itemStatus(item: FlowItem): string {
  if (item.is_allocated && item.is_paid) return "paid";
  if (item.is_allocated) return "unpaid";
  if (item.is_paid) return "flagged";
  return "none";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: string; text: string; color: string }> = {
    paid: { icon: "✓", text: "allocated · paid", color: "#2A9D8F" },
    unpaid: { icon: "◷", text: "allocated · unpaid", color: "var(--color-gold-light)" },
    flagged: { icon: "⚠", text: "not allocated · paid", color: "#f87171" },
    none: { icon: "○", text: "not allocated", color: "var(--color-text-muted)" },
  };
  const s = map[status];
  if (!s) return null;
  return (
    <span className="text-xs flex items-center gap-1" style={{ color: s.color }}>
      <span>{s.icon}</span> {s.text}
    </span>
  );
}

function money(n: number): string {
  return n.toLocaleString("en-RW");
}

function shortDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function Budget() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [month] = useState(currentMonth());
  const [data, setData] = useState<FlowMonth | null>(null);
  const [ledger, setLedger] = useState<FlowLedger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Manage-budgets panel state
  const [groupName, setGroupName] = useState("");
  const [groupCategory, setGroupCategory] = useState<Category>("need");
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [itemName, setItemName] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [flow, txns] = await Promise.all([
        getFlowMonth(month),
        getTransactions(month),
      ]);
      setData(flow);
      setLedger(txns);
      if (!selectedGroup && flow.groups.length > 0) {
        setSelectedGroup(flow.groups[0].group_id);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load Flow";
      setError(message);
      if (message.toLowerCase().includes("session")) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [month, navigate, selectedGroup]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      let targetGroup = selectedGroup;
      if (groupName.trim()) {
        const created = await createGroup(groupName.trim(), groupCategory);
        targetGroup = created.group.group_id;
        setGroupName("");
      }
      if (itemName.trim() && targetGroup) {
        await createItem({
          group_id: targetGroup,
          month,
          name: itemName.trim(),
          planned_amount: itemAmount ? Number(itemAmount) : 0,
        });
        setItemName("");
        setItemAmount("");
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const spendable = data?.totals.spendable ?? 0;
  const income = data?.budget?.income ?? 0;
  const guarded = data?.totals.protected ?? 0;

  // 3-month buffer target = three months of everything tagged "need"
  const needsTotal =
    data?.groups
      .filter((g) => g.category === "need")
      .reduce((sum, g) => sum + g.planned, 0) ?? 0;
  const bufferTarget = needsTotal * 3;
  const savingGroups = data?.groups.filter((g) => g.category === "saving") ?? [];
  const savedTotal = savingGroups.reduce((sum, g) => sum + g.planned, 0) + guarded;
  const bufferPct =
    bufferTarget > 0 ? Math.min(100, Math.round((savedTotal / bufferTarget) * 100)) : 0;

  const spendGroups = data?.groups.filter((g) => g.category !== "saving") ?? [];

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

        {error && (
          <div className="border border-red-500/30 bg-red-500/10 rounded-xl p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-[#131313] border border-[#232323] rounded-3xl p-10">
          {loading ? (
            <p className="text-[var(--color-text-muted)] text-sm">Loading…</p>
          ) : tab === "overview" ? (
            <div className="grid grid-cols-[1fr_360px] gap-10">
              {/* Left column */}
              <div>
                {/* Hero */}
                <div className="mb-8">
                  <div className="flex items-baseline gap-3">
                    <span className="font-mono text-5xl">RWF {money(spendable)}</span>
                    <span className="text-sm text-[var(--color-text-muted)]">
                      spendable
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Real RWF {money(income)}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                    <span className="text-[var(--color-gold-light)]">
                      RWF {money(guarded)} protected
                    </span>
                  </div>
                </div>

                {/* In/Out band */}
                <div className="flex items-center gap-10 py-6 border-y border-[var(--color-border)] mb-8">
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">↑ IN</p>
                    <p className="font-mono text-xl">
                      {money(data?.totals.money_in ?? 0)}
                    </p>
                  </div>
                  <div className="w-px h-10 bg-[var(--color-border)]" />
                  <div>
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">↓ OUT</p>
                    <p className="font-mono text-xl">
                      {money(data?.totals.money_out ?? 0)}
                    </p>
                  </div>
                </div>

                {/* Priority banner */}
                {bufferTarget > 0 && (
                  <div className="border-l-2 border-[var(--color-gold-light)] pl-4 py-2 mb-8">
                    <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-2">
                      Priority this payday
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-lg">
                      A 3-month buffer for your essentials would be{" "}
                      <span className="text-[var(--color-gold-light)]">
                        RWF {money(bufferTarget)}
                      </span>{" "}
                      — you're{" "}
                      <span className="text-[var(--color-gold-light)]">{bufferPct}%</span>{" "}
                      there.
                    </p>
                  </div>
                )}

                {/* Groups */}
                <div className="space-y-4">
                  {spendGroups.length === 0 && (
                    <p className="text-sm text-[var(--color-text-muted)]">
                      No expense groups yet — create one on the right.
                    </p>
                  )}

                  {spendGroups.map((g: FlowGroup) => (
                    <div
                      key={g.group_id}
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
                            {categoryLabel[g.category]}
                          </span>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-text-muted)]">
                          {money(g.spent)} / {money(g.planned)}
                        </p>
                      </div>
                      {g.items.length === 0 && (
                        <p className="text-xs text-[var(--color-text-muted)] py-1.5">
                          No items yet.
                        </p>
                      )}
                      {g.items.map((item) => (
                        <div
                          key={item.item_id}
                          className="flex justify-between items-center py-1.5"
                        >
                          <div className="flex items-center gap-2">
                            <p className="text-sm">{item.name}</p>
                            <StatusBadge status={itemStatus(item)} />
                          </div>
                          <p className="font-mono text-sm">
                            RWF {money(item.planned_amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ))}

                  {/* Protected savings groups */}
                  {savingGroups.map((g) => (
                    <div
                      key={g.group_id}
                      className="bg-[var(--color-card)] rounded-xl p-5 border-l-2 border-[var(--color-sapphire)]"
                    >
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
                            {g.name}
                          </p>
                          <span className="text-[10px] uppercase px-2 py-0.5 rounded-full text-[var(--color-gold-light)] border border-[var(--color-gold-light)]/40">
                            Saving · protected
                          </span>
                        </div>
                        <p className="font-mono text-sm text-[var(--color-gold-light)]">
                          RWF {money(g.planned)}
                        </p>
                      </div>
                      {bufferTarget > 0 && (
                        <>
                          <div className="h-1 bg-[#252525] rounded-full overflow-hidden w-40">
                            <div
                              className="h-full bg-[var(--color-gold-light)] rounded-full"
                              style={{ width: `${bufferPct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                            {bufferPct}% of 3-month target
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manage budgets panel */}
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl mb-6">
                  Manage budgets
                </p>

                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  New group name
                </label>
                <input
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Subscription Services"
                  className="w-full bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 mt-2 mb-5 text-sm placeholder:text-[var(--color-text-muted)]"
                />

                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  Category
                </label>
                <div className="flex gap-2 mt-2 mb-5">
                  {(["need", "want", "saving"] as Category[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setGroupCategory(c)}
                      className="px-3 py-1.5 rounded-full text-xs border transition-opacity"
                      style={{
                        borderColor: categoryColor[c],
                        color: categoryColor[c],
                        opacity: groupCategory === c ? 1 : 0.4,
                        background:
                          groupCategory === c ? `${categoryColor[c]}18` : "transparent",
                      }}
                    >
                      {categoryLabel[c]}
                    </button>
                  ))}
                </div>

                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  Add item to
                </label>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 mt-2 mb-4 text-sm"
                >
                  <option value="">— new group above —</option>
                  {data?.groups.map((g) => (
                    <option key={g.group_id} value={g.group_id}>
                      {g.name}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 mb-6">
                  <input
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="Item name"
                    className="flex-1 bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm placeholder:text-[var(--color-text-muted)]"
                  />
                  <input
                    value={itemAmount}
                    onChange={(e) => setItemAmount(e.target.value)}
                    placeholder="0"
                    type="number"
                    className="w-24 bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm font-mono placeholder:text-[var(--color-text-muted)]"
                  />
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving || (!groupName.trim() && !itemName.trim())}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] font-medium text-sm disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-10 mb-8">
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Income · this month
                  </p>
                  <p className="font-mono text-3xl text-[#2A9D8F]">
                    +{money(ledger?.totals.money_in ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Expenses · this month
                  </p>
                  <p className="font-mono text-3xl text-red-400">
                    -{money(ledger?.totals.money_out ?? 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">Net</p>
                  <p className="font-mono text-3xl">
                    {(ledger?.totals.net ?? 0) > 0 ? "+" : ""}
                    {money(ledger?.totals.net ?? 0)}
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="grid grid-cols-[80px_1fr_180px_120px] text-xs uppercase text-[var(--color-text-muted)] pb-3 border-b border-[var(--color-border)]">
                <span>Date</span>
                <span>Item</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>

              {(ledger?.transactions.length ?? 0) === 0 && (
                <p className="text-sm text-[var(--color-text-muted)] py-6">
                  No transactions recorded this month.
                </p>
              )}

              {ledger?.transactions.map((t) => (
                <div
                  key={t.txn_id}
                  className="grid grid-cols-[80px_1fr_180px_120px] items-center py-4 border-b border-[var(--color-border)]"
                >
                  <span className="font-mono text-xs text-[var(--color-text-muted)]">
                    {shortDate(t.txn_date)}
                  </span>
                  <div>
                    <p className="text-sm">
                      {t.item_name ?? t.note ?? (t.source || "Income")}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {t.type === "income"
                        ? `Income${t.source ? ` · ${t.source}` : ""}`
                        : `${t.group_name ?? "Uncategorised"}${
                            t.category ? ` · ${categoryLabel[t.category]}` : ""
                          }`}
                    </p>
                  </div>
                  <span>
                    {t.type === "expense" && t.is_allocated !== null && (
                      <StatusBadge
                        status={itemStatus({
                          is_allocated: t.is_allocated,
                          is_paid: t.is_paid,
                        } as FlowItem)}
                      />
                    )}
                  </span>
                  <span
                    className={`font-mono text-right ${
                      t.type === "income" ? "text-[#2A9D8F]" : "text-red-400"
                    }`}
                  >
                    {t.type === "income" ? "+" : "-"}
                    {money(t.amount)}
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