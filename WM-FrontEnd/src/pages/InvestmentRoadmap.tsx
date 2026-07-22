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
    yieldLabel: "~9–13% p.a.",
    yieldColor: "#2A9D8F",
    gradientFrom: "#2D7A5F",
    gradientTo: "#0F2A21",
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
    yieldLabel: "Market-linked",
    yieldColor: "var(--color-text-primary)",
    gradientFrom: "#2952A3",
    gradientTo: "#0C1E3D",
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
    yieldLabel: "Variable",
    yieldColor: "var(--color-gold-light)",
    gradientFrom: "#D4A017",
    gradientTo: "#3A2A05",
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
    yieldLabel: "Annual dividend",
    yieldColor: "#2A9D8F",
    gradientFrom: "#1B4D3E",
    gradientTo: "#0A1F19",
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
          {investmentOptions.map((opt) => (
            <Link
              key={opt.id}
              to={`/invest/${opt.id}`}
              className="rounded-2xl p-7 relative overflow-hidden min-h-[220px] flex flex-col justify-between"
              style={{
                background: `linear-gradient(135deg, #000000 0%, ${opt.gradientFrom}66 100%)`,
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
                  <span className="font-mono" style={{ color: opt.yieldColor }}>
                    {opt.yieldLabel}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
