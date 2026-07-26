import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

function fmtRWF(n: string) {
  return "RWF " + Math.round(parseFloat(n)).toLocaleString("en-RW");
}

export default function InvestmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [option, setOption] = useState<InvestmentOption | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/investments`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const found = data.options.find((o: InvestmentOption) => o.option_id === id);
          setOption(found || null);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      <button
        onClick={() => navigate("/invest")}
        className="text-[var(--color-text-muted)] px-8 pt-6 pb-2 block"
      >
        Back
      </button>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-text-muted)] mb-2">
          {option.risk_level} risk
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl mb-8">
          {option.name}
        </h1>
        <div className="flex justify-between text-sm pb-3 mb-3 border-b border-white/10">
          <span className="text-white/60">Min. Entry</span>
          <span className="font-mono text-white">{fmtRWF(option.min_amount)}</span>
        </div>
        <div className="flex justify-between text-sm pb-3 mb-3 border-b border-white/10">
          <span className="text-white/60">Est. Yield</span>
          <span className="font-mono text-white">{option.expected_return}% p.a.</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-white/60">Country</span>
          <span className="font-mono text-white">{option.country}</span>
        </div>
      </div>
    </div>
  );
}