import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { RISK_GRADIENTS, fmtRWF, type InvestmentOption } from "./InvestmentRoadmap";

const API_URL = import.meta.env.VITE_API_URL;

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [option, setOption] = useState<InvestmentOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/investments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.options.find(
            (o: InvestmentOption) => o.option_id === id,
          );
          setOption(found || null);
          if (found) setAmount(found.min_amount);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="px-8 py-20 text-center">
          <p className="text-[var(--color-text-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

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

  const gradient = RISK_GRADIENTS[option.risk_level] ?? RISK_GRADIENTS.medium;
  const projected = fmtRWF(amount * (1 + option.expected_return / 100));

  return (
    <div className="min-h-screen">
      <Navbar />
      <button
        onClick={() => navigate("/invest")}
        className="text-[var(--color-text-muted)] px-8 pt-6 pb-2 block"
      >
        Back
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
            {option.risk_level} risk · {option.country}
          </p>
        </div>
      </div>

      <div className="px-8 py-8">
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
              min={option.min_amount}
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
            <span className="font-mono">{fmtRWF(option.min_amount)}</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-t border-[var(--color-border)]">
            <span className="text-[var(--color-text-muted)]">Est. yield</span>
            <span className="font-mono">{option.expected_return}% p.a.</span>
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
      </div>
    </div>
  );
}
