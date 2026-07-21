import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { investmentOptions } from "./InvestmentRoadmap";

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const option = investmentOptions.find((o) => o.id === id);

  if (!option) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="px-8 py-20 text-center">
          <p className="text-[var(--color-text-muted)]">
            Investment option not found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <button
        onClick={() => navigate("/invest")}
        className="text-[var(--color-text-muted)] px-8 pt-6 pb-2 block"
      >
        ← Back
      </button>

      {/* Hero — taller, full-bleed, smoothly fading into the page background */}
      <div className="relative w-full min-h-[420px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 90% at 50% 30%, ${option.gradientFrom}CC 0%, ${option.gradientFrom}55 45%, transparent 75%)`,
          }}
        />
        {/* Fade-to-background overlay, sits on top of the gradient, blends the bottom into the page */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, transparent 40%, var(--color-obsidian) 95%)`,
          }}
        />
        <div className="relative z-10 h-full flex flex-col justify-end px-8 pb-10 min-h-[420px]">
          <p className="font-[family-name:var(--font-display)] text-4xl text-[var(--color-text-primary)] mb-2">
            {option.name}
          </p>
          <p className="font-mono text-sm text-white/70">
            {option.riskLabel} · {option.country}
          </p>
        </div>
      </div>

      {/* Content below hero — same left margin as hero, cards stretch full width */}
      <div className="px-8 py-8">
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-2xl">
          {option.description}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-[var(--color-card)] rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              Minimum
            </p>
            <p className="font-mono text-lg">{option.minimum}</p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              Return
            </p>
            <p className="font-mono text-lg" style={{ color: "#2A9D8F" }}>
              {option.returnText}
            </p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl p-4">
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-1">
              Access
            </p>
            <p className="font-mono text-lg">{option.access}</p>
          </div>
        </div>

        <a
          href={option.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-3 rounded-full bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-emerald-light)] text-[var(--color-obsidian)] font-medium mb-2 max-w-md"
        >
          {option.ctaLabel} →
        </a>
        <p className="text-xs text-[var(--color-text-muted)]">
          Opens the official {option.platformName} platform.
        </p>
      </div>
    </div>
  );
}
