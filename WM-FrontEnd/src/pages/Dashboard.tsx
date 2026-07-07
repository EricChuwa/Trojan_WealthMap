import Navbar from "../components/Navbar";

export default function Dashboard() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10 relative">
        {/* Faint accent glow */}
        <div className="absolute -top-10 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--color-emerald-light)] to-[var(--color-gold)] opacity-10 blur-3xl pointer-events-none" />

        {/* Hero: two columns */}
        <div className="grid grid-cols-2 gap-6 relative z-10 mb-10">
          <div className="bg-[var(--color-card)] rounded-2xl p-8">
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Good morning,{" "}
              <span className="text-[var(--color-text-primary)]">Raphael</span>
            </p>
            <div className="font-[var(--font-display)] text-7xl bg-gradient-to-b from-[var(--color-text-primary)] to-[var(--color-gold-light)] bg-clip-text text-transparent">
              72
            </div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mt-1 mb-4">
              Financial health
            </p>
            <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
              Your literacy score is your lowest area — one lesson today would
              move the needle.
            </p>
          </div>

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
                  <p className="font-mono text-xl">RWF 450,000</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--color-text-muted)] mb-1">
                    Spent
                  </p>
                  <p className="font-mono text-xl text-[var(--color-gold-light)]">
                    RWF 150,000
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-card)] rounded-2xl p-6 border-l-2 border-[var(--color-gold-light)]">
              <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-2">
                Priority today
              </p>
              <p className="font-[var(--font-display)] text-lg mb-2">
                Complete <span className="text-[#2A9D8F]">"Staying Safe"</span>{" "}
                — your Learn score is 15% below target.
              </p>
              <p className="text-xs text-[var(--color-gold-light)]">
                Start lesson →
              </p>
            </div>
          </div>
        </div>

        {/* Lower: goals + investment roadmap */}
        <div className="grid grid-cols-2 gap-6 relative z-10">
          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[var(--font-display)] text-2xl">Goals</p>
              <p className="text-xs text-[var(--color-text-muted)]">See all</p>
            </div>
            {[
              {
                name: "MacBook Pro",
                sub: "6 months left",
                pct: "68%",
                color: "text-[#2A9D8F]",
              },
              {
                name: "Emergency Fund",
                sub: "9 months left",
                pct: "34%",
                color: "text-[var(--color-gold-light)]",
              },
              {
                name: "Travel",
                sub: "11 months left",
                pct: "12%",
                color: "text-[var(--color-text-muted)]",
              },
            ].map((goal) => (
              <div
                key={goal.name}
                className="bg-[var(--color-card)] rounded-xl p-5 mb-3 flex justify-between items-center"
              >
                <div>
                  <p className="font-[var(--font-display)] text-lg">
                    {goal.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {goal.sub}
                  </p>
                </div>
                <p className={`font-mono text-xl ${goal.color}`}>{goal.pct}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <p className="font-[var(--font-display)] text-2xl">
                Investment roadmap
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">See all</p>
            </div>
            <div className="rounded-xl p-6 mb-3 bg-gradient-to-br from-[var(--color-emerald-light)] to-[#0F2A21]">
              <p className="font-[var(--font-display)] text-lg">
                Money Market Fund
              </p>
              <p className="text-xs opacity-80 mb-6">~10%/yr return</p>
              <div className="flex justify-between items-end">
                <p className="font-mono text-xs opacity-80">Min. RWF 10,000</p>
                <p className="font-mono text-lg">RWF 1,420,500</p>
              </div>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-br from-[var(--color-sapphire)] to-[#0C1E3D]">
              <p className="font-[var(--font-display)] text-lg">
                Treasury Bills
              </p>
              <p className="text-xs opacity-80 mb-6">~12%/yr return</p>
              <div className="flex justify-between items-end">
                <p className="font-mono text-xs opacity-80">Min. RWF 500,000</p>
                <p className="font-mono text-lg">RWF 850,000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
