import { useNavigate } from "react-router-dom";
import heroPortrait from "../assets/portrait.png";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="bg-[var(--color-obsidian)] text-[var(--color-text-primary)]">
      {/* ===== NAV ===== */}
      <nav className="flex items-center justify-between px-10 py-6 border-b border-[var(--color-border)]">
        <p className="font-[family-name:var(--font-display)] text-xl">
          Wealth<span className="text-[var(--color-gold-light)]">Map</span>
        </p>
        <div className="flex gap-8 text-sm text-[var(--color-text-muted)]">
          <span>Home</span>
          <span>Budget</span>
          <span>Invest</span>
          <span>Goals</span>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("/login")}
            className="text-sm text-[var(--color-text-muted)]"
          >
            Log In
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] text-sm font-medium px-5 py-2.5 rounded-full"
          >
            GET STARTED
          </button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <div className="grid grid-cols-2 min-h-[680px]">
        <div className="flex flex-col justify-center px-14 py-16">
          <h1 className="font-[family-name:var(--font-display)] text-5xl leading-tight mb-5">
            Your money,
            <br />
            decided with{" "}
            <span className="text-[var(--color-gold-light)] italic">
              dignity
            </span>
            .
          </h1>
          <p className="text-[var(--color-text-muted)] max-w-sm mb-8">
            Moving beyond the noise. Master your personal economy through
            editorial clarity and high-end financial craft.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] text-sm font-medium px-6 py-3 rounded-full"
            >
              GET STARTED
            </button>
            <button className="border border-[var(--color-border)] text-sm px-6 py-3 rounded-full">
              VIEW ROADMAP
            </button>
          </div>
        </div>

        <div className="relative">
          <img
            src={heroPortrait}
            alt=""
            className="absolute bottom-0 right-32 h-full w-auto object-contain"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-obsidian)] via-transparent to-transparent" />
        </div>
      </div>

      {/* ===== THREE PILLARS ===== */}
      <div className="grid grid-cols-3 gap-10 px-14 py-16 border-t border-[var(--color-border)]">
        {[
          {
            tag: "STRATEGY",
            title: "Decide with\nPayday Flow",
            body: "Orchestrate your income with mechanical precision. No random guesswork, just a clear path from arrival to allocation.",
            cta: "LEARN MORE",
          },
          {
            tag: "GROWTH",
            title: "Grow with the\nInvestment Roadmap",
            body: "A curated approach to wealth building. We strip away the volatility to focus on the long-term compounding of quiet assets.",
            cta: "EXPLORE ROADMAP",
          },
          {
            tag: "RISK CONTROL",
            title: "Protect with\nThe Smell Test",
            body: "Our proprietary vetting framework. Identify fragility in your portfolio before the market does, maintaining absolute security.",
            cta: "SMELL TEST",
          },
        ].map((pillar) => (
          <div key={pillar.tag}>
            <p className="text-xs uppercase tracking-widest text-[var(--color-gold-light)] mb-3">
              {pillar.tag}
            </p>
            <h3 className="font-[family-name:var(--font-display)] text-2xl mb-3 whitespace-pre-line">
              {pillar.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              {pillar.body}
            </p>
            <p className="text-xs text-[var(--color-gold-light)]">
              {pillar.cta} →
            </p>
          </div>
        ))}
      </div>

      {/* ===== STATS ===== */}
      <div className="grid grid-cols-4 border-t border-b border-[var(--color-border)] py-12 px-14">
        {[
          { value: "2.4B", label: "ASSETS MANAGED" },
          { value: "15%", label: "AVG GROWTH" },
          { value: "50K", label: "ACTIVE MASTERS" },
          { value: "0.0", label: "DEBT TRAP RATE" },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-mono text-3xl text-[var(--color-gold-light)]">
              {stat.value}
            </p>
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ===== DASHBOARD PREVIEW ===== */}
      <div className="grid grid-cols-2 gap-14 px-14 py-20 items-center">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl leading-tight mb-5">
            Master the
            <br />
            Quiet Dashboard.
          </h2>
          <p className="text-[var(--color-text-muted)] max-w-sm mb-6">
            We removed the red and green flashes. Experience financial data as a
            serene editorial experience, allowing for better decision-making
            through calm.
          </p>
          <ul className="space-y-3 text-sm">
            {[
              "Zero-Clutter Visualizations",
              "Material-Inspired Data Cards",
              "High-Resolution Reporting",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[var(--color-text-muted)]"
              >
                <span className="text-[var(--color-gold-light)]">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[var(--color-card)] rounded-2xl p-7 border border-[var(--color-border)]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
            Portfolio Balance
          </p>
          <div className="flex items-baseline gap-3 mb-6">
            <p className="font-mono text-3xl">RWF 4,280,000</p>
            <p className="text-xs text-[#2A9D8F]">+12.4% this year</p>
          </div>
          <div className="flex gap-6 border-b border-[var(--color-border)] mb-5 text-sm">
            <p className="pb-2 border-b-2 border-[var(--color-gold-light)]">
              Liquidity
            </p>
            <p className="pb-2 text-[var(--color-text-muted)]">Stability</p>
          </div>
          <div className="space-y-4">
            {[
              { name: "Kigali Tech Fund", value: "1,300,000 RWF" },
              { name: "Bonds (Treasury)", value: "2,000,000 RWF" },
              { name: "Ninja Retail Assets", value: "980,000 RWF" },
            ].map((row) => (
              <div key={row.name} className="flex justify-between text-sm">
                <p className="text-[var(--color-text-muted)]">{row.name}</p>
                <p className="font-mono">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-[var(--color-border)] px-14 py-12 grid grid-cols-3 gap-10">
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg mb-3">
            WealthMap
          </p>
          <p className="text-sm text-[var(--color-text-muted)] max-w-xs">
            Crafting financial futures for the modern African achiever. Decided
            with dignity, grown with mastery.
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
            Platform
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>Payday Flow</li>
            <li>Roadmap</li>
            <li>Smell Test</li>
            <li>Education</li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
            Company
          </p>
          <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
            <li>Our Ethos</li>
            <li>Careers</li>
            <li>Privacy</li>
            <li>Terms</li>
          </ul>
        </div>
      </footer>
      <div className="flex justify-between items-center px-14 py-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
        <p>© 2026 WealthMap Technologies. All rights reserved.</p>
        <div className="flex gap-4">
          <span>Twitter</span>
          <span>Instagram</span>
          <span>LinkedIn</span>
        </div>
      </div>
    </div>
  );
}
