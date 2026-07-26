import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

interface InvestmentOption {
  option_id: string;
  country: string;
  name: string;
  risk_level: "low" | "medium" | "high";
  min_amount: string;
  expected_return: string;
}

const RISK_GRADIENTS: Record<string, { from: string; to: string; textColor: string }> = {
  low: { from: "#2D7A5F", to: "#0F2A21", textColor: "#2A9D8F" },
  medium: { from: "#D4A017", to: "#3A2A05", textColor: "#e0b96a" },
  high: { from: "#8B1A1A", to: "#2A0F0F", textColor: "#f87171" },
};

function fmtRWF(n: string) {
  return "RWF " + Math.round(parseFloat(n)).toLocaleString("en-RW");
}

export default function InvestmentRoadmap() {
  const [options, setOptions] = useState<InvestmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/investments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOptions(data.options);
        } else {
          setError("Could not load investment options.");
        }
      })
      .catch(() => setError("Could not load investment options."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10">
        <p className="font-[family-name:var(--font-display)] text-4xl mb-2">
          For you in Rwanda
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          Ordered from lowest to highest risk.
        </p>

        {loading && <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>}
        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="grid grid-cols-2 gap-6">
          {options.map((opt) => {
            const gradient = RISK_GRADIENTS[opt.risk_level] ?? RISK_GRADIENTS.medium;
            return (
              <div
                key={opt.option_id}
                className="rounded-2xl p-7 relative overflow-hidden min-h-[220px] flex flex-col justify-between"
                style={{
                  background: `linear-gradient(135deg, #000000 0%, ${gradient.from}66 100%)`,
                }}
              >
                <span className="text-[10px] uppercase tracking-widest text-white/70 self-start">
                  {opt.risk_level} risk
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-5">
                    {opt.name}
                  </p>
                  <div className="flex justify-between text-xs pb-3 mb-3 border-b border-white/10">
                    <span className="text-white/60">Min. Entry</span>
                    <span className="font-mono text-white">{fmtRWF(opt.min_amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Est. Yield</span>
                    <span className="font-mono" style={{ color: gradient.textColor }}>
                      {opt.expected_return}% p.a.
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}