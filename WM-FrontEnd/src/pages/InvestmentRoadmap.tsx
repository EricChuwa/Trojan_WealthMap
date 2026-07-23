import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export const investmentOptions = [
  {
    id: "government-bonds",
    level: 1,
    name: "Government Treasury Bonds",
    riskLabel: "Very low risk",
    country: "Rwanda",
    minEntry: "RWF 100,000",
    minEntryValue: 100000,
    yieldLabel: "~9–13% p.a.",
    yieldPct: 11,
    description:
      "Fixed-coupon bonds issued by the Government of Rwanda through the National Bank of Rwanda (BNR). One of the safest ways to grow money locally, with returns paid on a fixed schedule and the principal returned at maturity.",
    minimum: "RWF 100,000 (non-competitive bid)",
    returnText: "~9–13%/yr",
    access: "At maturity, or sellable via RSE",
    platformName: "National Bank of Rwanda (BNR)",
    platformUrl: "https://www.bnr.rw",
    ctaLabel: "Invest now",
  },
  {
    id: "bk-capital",
    level: 2,
    name: "BK Capital Investment Plans",
    riskLabel: "Low to medium risk",
    country: "Rwanda",
    minEntry: "Varies by product",
    minEntryValue: 50000,
    yieldLabel: "Market-linked",
    yieldPct: null,
    description:
      "Rwanda's leading investment bank and fund manager, offering guided stock brokerage, fund management, and advisory services for first-time and experienced investors alike.",
    minimum: "Varies by product",
    returnText: "Market-linked",
    access: "Depends on product",
    platformName: "BK Capital",
    platformUrl: "https://bkcapital.rw",
    ctaLabel: "Invest now",
  },
  {
    id: "rse-equities",
    level: 3,
    name: "RSE Listed Equities",
    riskLabel: "Medium risk",
    country: "Rwanda",
    minEntry: "No fixed minimum",
    minEntryValue: 10000,
    yieldLabel: "Variable",
    yieldPct: null,
    description:
      "Buy shares in companies listed on the Rwanda Stock Exchange, such as Bank of Kigali, BRALIRWA, and MTN Rwandacell. Returns come from share price growth and dividends, but values can rise and fall.",
    minimum: "No fixed minimum",
    returnText: "Variable",
    access: "During trading hours, via a licensed broker",
    platformName: "Rwanda Stock Exchange (RSE)",
    platformUrl: "https://rse.rw",
    ctaLabel: "Invest now",
  },
  {
    id: "sacco",
    level: 1,
    name: "Umurenge SACCO",
    riskLabel: "Very low risk",
    country: "Rwanda",
    minEntry: "As low as RWF 1,000",
    minEntryValue: 1000,
    yieldLabel: "Annual dividend",
    yieldPct: 6,
    description:
      "Community-based cooperative savings and credit societies present in every sector of Rwanda. Member savings are pooled and grow through cooperative lending, paying an annual dividend.",
    minimum: "As low as RWF 1,000",
    returnText: "Annual dividend",
    access: "Via your local sector SACCO branch",
    platformName: "Rwanda Cooperative Agency (regulator)",
    platformUrl: "https://rca.gov.rw",
    ctaLabel: "Find your sector SACCO",
  },
];

// Colour is derived from risk level, not hand-assigned — so any number of
// options coming from the real API (not just these 4) automatically gets a
// consistent, meaningful colour without anyone picking it manually.
const riskGradients: Record<
  string,
  { from: string; to: string; textColor: string }
> = {
  "very low": { from: "#2D7A5F", to: "#0F2A21", textColor: "#2A9D8F" },
  low: {
    from: "#2952A3",
    to: "#0C1E3D",
    textColor: "var(--color-text-primary)",
  },
  "low to medium": {
    from: "#2952A3",
    to: "#0C1E3D",
    textColor: "var(--color-text-primary)",
  },
  medium: {
    from: "#D4A017",
    to: "#3A2A05",
    textColor: "var(--color-gold-light)",
  },
  high: { from: "#8B1A1A", to: "#2A0F0F", textColor: "#f87171" },
};

export function getRiskGradient(riskLabel: string) {
  const key = riskLabel.toLowerCase().replace(" risk", "").trim();
  return riskGradients[key] ?? riskGradients["medium"]; // safe fallback for any unrecognised label
}

export default function InvestmentRoadmap() {
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

        <div className="grid grid-cols-2 gap-6">
          {investmentOptions.map((opt) => {
            const gradient = getRiskGradient(opt.riskLabel);
            return (
              <Link
                key={opt.id}
                to={`/invest/${opt.id}`}
                className="rounded-2xl p-7 relative overflow-hidden min-h-[220px] flex flex-col justify-between"
                style={{
                  background: `linear-gradient(135deg, #000000 0%, ${gradient.from}66 100%)`,
                }}
              >
                <span className="text-[10px] uppercase tracking-widest text-white/70 self-start">
                  Level {opt.level}
                </span>
                <div>
                  <p className="font-[family-name:var(--font-display)] text-2xl text-[var(--color-text-primary)] mb-5">
                    {opt.name}
                  </p>
                  <div className="flex justify-between text-xs pb-3 mb-3 border-b border-white/10">
                    <span className="text-white/60">Min. Entry</span>
                    <span className="font-mono text-white">{opt.minEntry}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/60">Est. Yield</span>
                    <span
                      className="font-mono"
                      style={{ color: gradient.textColor }}
                    >
                      {opt.yieldLabel}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
