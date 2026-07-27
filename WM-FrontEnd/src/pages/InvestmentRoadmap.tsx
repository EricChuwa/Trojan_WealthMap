import { useState } from "react";
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
      "Fixed-coupon bonds issued by the Government of Rwanda, through the National Bank of Rwanda (BNR). One of the safest ways to grow money locally, with returns paid on a fixed schedule and the principal returned at maturity.",
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
      "Community-based cooperative, savings and credit societies present in every sector of Rwanda. Member savings are pooled and grow through cooperative lending, paying an annual dividend.",
    minimum: "As low as RWF 1,000",
    returnText: "Annual dividend",
    access: "Via your local sector SACCO branch",
    platformName: "Rwanda Cooperative Agency (regulator)",
    platformUrl: "https://rca.gov.rw",
    ctaLabel: "Find your sector SACCO",
  },
  {
    id: "money-market-fund",
    level: 1,
    name: "Money Market Unit Trust",
    riskLabel: "Very low risk",
    country: "Rwanda",
    minEntry: "RWF 10,000",
    minEntryValue: 10000,
    yieldLabel: "~9–10% p.a.",
    yieldPct: 9.5,
    description:
      "A pooled fund investing in short-term, low-risk instruments like treasury bills and fixed deposits. Managed by a licensed fund manager, it offers same-week liquidity with steadier returns than a bank savings account.",
    minimum: "RWF 10,000 initial deposit",
    returnText: "~9–10%/yr",
    access: "Redeemable within days, via the fund manager",
    platformName: "Capital Markets Authority (regulator)",
    platformUrl: "https://cma.rw",
    ctaLabel: "Invest now",
  },
  {
    id: "corporate-bonds",
    level: 2,
    name: "Corporate & Green Bonds",
    riskLabel: "Low to medium risk",
    country: "Rwanda",
    minEntry: "RWF 50,000",
    minEntryValue: 50000,
    yieldLabel: "~11–14% p.a.",
    yieldPct: 12.5,
    description:
      "Fixed-income bonds issued by Rwandan corporations and banks (including green bonds financing sustainable projects), listed on the RSE. Higher yield than government bonds, with credit risk tied to the issuer.",
    minimum: "RWF 50,000 (varies by issue)",
    returnText: "~11–14%/yr",
    access: "At maturity, or sellable via RSE",
    platformName: "Rwanda Stock Exchange (RSE)",
    platformUrl: "https://rse.rw",
    ctaLabel: "Invest now",
  },
  {
    id: "real-estate-reit",
    level: 3,
    name: "Real Estate Investment Trusts",
    riskLabel: "Medium risk",
    country: "Rwanda",
    minEntry: "Varies by offering",
    minEntryValue: 100000,
    yieldLabel: "Rental yield + growth",
    yieldPct: null,
    description:
      "Pooled vehicles that invest in income-generating property — commercial buildings, housing developments — letting you earn rental-linked returns without buying property outright. Still an emerging asset class in Rwanda.",
    minimum: "Varies by offering",
    returnText: "Rental yield + capital growth",
    access: "Depends on the specific trust or developer",
    platformName: "Rwanda Stock Exchange (RSE)",
    platformUrl: "https://rse.rw",
    ctaLabel: "Learn more",
  },
  {
    id: "diaspora-bonds",
    level: 1,
    name: "Diaspora Direct Investment Bonds",
    riskLabel: "Very low risk",
    country: "Rwanda",
    minEntry: "USD 100 equivalent",
    minEntryValue: 130000,
    yieldLabel: "~5–7% p.a. (USD)",
    yieldPct: 6,
    description:
      "Dollar-denominated bonds issued by the Government of Rwanda specifically for Rwandans abroad, letting the diaspora invest directly in national development while earning fixed, dollar-based returns.",
    minimum: "USD 100 (or equivalent)",
    returnText: "~5–7%/yr (USD)",
    access: "At maturity, via participating banks",
    platformName: "National Bank of Rwanda (BNR)",
    platformUrl: "https://www.bnr.rw",
    ctaLabel: "Invest now",
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

// How many cards show before "Load more" — two full rows at 3 columns.
const PAGE_SIZE = 6;

export default function InvestmentRoadmap() {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const visibleOptions = investmentOptions.slice(0, visibleCount);
  const hasMore = visibleCount < investmentOptions.length;

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
                  Level {opt.level}
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