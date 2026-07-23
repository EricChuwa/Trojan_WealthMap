import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { investmentOptions, getRiskGradient } from "./InvestmentRoadmap";

function fmtRWF(n: number) {
  return "RWF " + Math.round(n).toLocaleString("en-RW");
}

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const option = investmentOptions.find((o) => o.id === id);

  const [amount, setAmount] = useState(option?.minEntryValue ?? 0);
  const [toast, setToast] = useState<string | null>(null);

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

  const gradient = getRiskGradient(option.riskLabel);
  const projected =
    option.yieldPct != null
      ? fmtRWF(amount * (1 + option.yieldPct / 100))
      : "Not predictable";

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
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

      {/* Full-bleed hero */}
      <div className="relative w-full min-h-[420px] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 90% at 50% 30%, ${gradient.from}CC 0%, ${gradient.from}55 45%, transparent 75%)`,
          }}
        />
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
            Level {option.level} · {option.riskLabel} · {option.country}
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
        <p className="text-[var(--color-text-secondary)] mb-8 max-w-2xl">
          {option.description}
        </p>

        {/* Calculator */}
        <div className="bg-[var(--color-card)] rounded-2xl p-6 mb-6 max-w-lg">
          <label className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] block mb-3">
            Amount to invest
          </label>
          <div className="flex items-center gap-2 mb-5">
            <span className="font-mono text-[var(--color-text-muted)]">
              RWF
            </span>
            <input
              type="number"
              min={option.minEntryValue}
              step={100}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-[var(--color-obsidian)] border border-[var(--color-border)] rounded-lg px-3 py-2 font-mono text-lg focus:border-[var(--color-gold-light)] outline-none"
            />
          </div>

          <div className="flex justify-between text-sm py-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">
              Minimum entry
            </span>
            <span className="font-mono">{option.minimum}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Est. yield</span>
            <span className="font-mono">{option.yieldLabel}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">
              Projected in 1 year
            </span>
            <span className="font-mono" style={{ color: "#2A9D8F" }}>
              {projected}
            </span>
          </div>
        </div>

        <a
          href={option.platformUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => showToast(`Opening ${option.platformName}...`)}
          className="block text-center py-3 rounded-full font-medium mb-2 max-w-md bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-emerald-light)] text-[var(--color-obsidian)]"
        >
          {option.ctaLabel} →
        </a>
        <p className="text-xs text-[var(--color-text-muted)]">
          Opens the official {option.platformName} platform.
        </p>
      </div>

      {toast && (
        <div className="fixed bottom-7 left-1/2 -translate-x-1/2 bg-[var(--color-card)] border border-[var(--color-border)] px-5 py-3 rounded-xl text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}
