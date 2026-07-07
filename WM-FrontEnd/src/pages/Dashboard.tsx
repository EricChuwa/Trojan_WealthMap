export default function Dashboard() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-md mx-auto">
      <p className="text-sm text-[var(--color-text-muted)] mb-8">
        Good morning,{" "}
        <span className="text-[var(--color-text-primary)]">Raphael</span>
      </p>

      {/* Hero health score */}
      <div className="text-center mb-10">
        <div className="font-[var(--font-display)] text-8xl bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-gold-light)] bg-clip-text text-transparent">
          72
        </div>
        <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mt-1">
          Financial health
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mt-3 max-w-xs mx-auto">
          Your literacy score is your lowest area — one lesson today would move
          the needle.
        </p>
      </div>

      <div className="h-px bg-[var(--color-border)] my-8" />

      {/* Income vs spend */}
      <div className="flex justify-between mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
            Income
          </p>
          <p className="font-mono text-xl">KES 45,000</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
            Spent
          </p>
          <p className="font-mono text-xl text-[var(--color-gold-light)]">
            KES 31,200
          </p>
        </div>
      </div>

      {/* Goal chips */}
      <div className="flex gap-3 overflow-x-auto mb-10 pb-2">
        {[
          { name: "MacBook Pro", pct: "68%", color: "text-[#2A9D8F]" },
          {
            name: "Emergency Fund",
            pct: "34%",
            color: "text-[var(--color-gold-light)]",
          },
          {
            name: "Travel",
            pct: "12%",
            color: "text-[var(--color-text-muted)]",
          },
        ].map((goal) => (
          <div
            key={goal.name}
            className="flex-shrink-0 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl px-4 py-3 min-w-[110px]"
          >
            <p className={`font-mono text-2xl ${goal.color}`}>{goal.pct}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {goal.name}
            </p>
          </div>
        ))}
      </div>

      {/* Priority action */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-2">
          Priority today
        </p>
        <p className="font-[var(--font-display)] text-xl">
          Complete <span className="text-[#2A9D8F]">"Staying Safe"</span> — your
          Learn score is 15% below target.
        </p>
      </div>
    </div>
  );
}
