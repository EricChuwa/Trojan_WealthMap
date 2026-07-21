import { useState } from "react";
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
    minEntryValue: 50000,
    yieldLabel: "Market-linked",
    yieldPct: null,
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
    minEntryValue: 10000,
    yieldLabel: "Variable",
    yieldPct: null,
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
    minEntryValue: 1000,
    yieldLabel: "Annual dividend",
    yieldPct: 6,
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

type Option = (typeof investmentOptions)[number];

function fmtRWF(n: number) {
  return "RWF " + Math.round(n).toLocaleString("en-RW");
}

export default function InvestmentRoadmap() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [invested, setInvested] = useState<Set<string>>(new Set());
  const [amount, setAmount] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);

  const active: Option | undefined = investmentOptions.find((o) => o.id === activeId);

  function openModal(opt: Option) {
    setActiveId(opt.id);
    setAmount(opt.minEntryValue);
  }

  function closeModal() {
    setActiveId(null);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  function handleInvest() {
    if (!active) return;
    setInvested((prev) => new Set(prev).add(active.id));
    closeModal();
    showToast(`Invested in ${active.name}`);
  }

  const projected =
    active && active.yieldPct
      ? fmtRWF(amount * (1 + active.yieldPct / 100))
      : "Not predictable";

  return (
    <div className="min-h-screen investment-roadmap-page">
      <style>{`
        .investment-roadmap-page .inv-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
        }
        @media (max-width: 700px) {
          .investment-roadmap-page .inv-grid { grid-template-columns: 1fr; }
        }
        .investment-roadmap-page .inv-card {
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          padding: 26px 26px 24px;
          cursor: pointer;
          min-height: 220px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.18s ease, filter 0.18s ease;
          border: none;
          text-align: left;
          width: 100%;
        }
        .investment-roadmap-page .inv-card:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .investment-roadmap-page .inv-level {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255,255,255,0.7);
          align-self: flex-start;
        }
        .investment-roadmap-page .inv-title {
          font-family: var(--font-display);
          font-size: 22px;
          color: var(--color-text-primary);
          margin: 18px 0 16px;
        }
        .investment-roadmap-page .inv-row {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          padding: 10px 0;
        }
        .investment-roadmap-page .inv-row + .inv-row {
          border-top: 1px solid rgba(255,255,255,0.1);
        }
        .investment-roadmap-page .inv-row .label { color: rgba(255,255,255,0.6); }
        .investment-roadmap-page .inv-row .val { font-family: monospace; color: white; }

        .investment-roadmap-page .overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,.6);
          display: flex; align-items: center; justify-content: center;
          z-index: 50; padding: 20px; backdrop-filter: blur(2px);
        }
        .investment-roadmap-page .modal {
          background: #141412; border: 1px solid #232320; border-radius: 16px;
          max-width: 460px; width: 100%; padding: 32px;
          max-height: 88vh; overflow-y: auto; color: #f2f0e9;
        }
        .investment-roadmap-page .modal-head {
          display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;
        }
        .investment-roadmap-page .modal-close {
          background: none; border: none; color: #65635c;
          font-size: 20px; cursor: pointer; line-height: 1; padding: 4px;
        }
        .investment-roadmap-page .modal-close:hover { color: #f2f0e9; }
        .investment-roadmap-page .modal h2 {
          font-family: Georgia, serif; font-size: 26px; font-weight: 400; margin: 14px 0 4px;
        }
        .investment-roadmap-page .modal .desc {
          font-size: 13.5px; color: #9a9890; line-height: 1.6; margin: 14px 0 22px;
        }
        .investment-roadmap-page .calc {
          background: #111110; border: 1px solid #232320; border-radius: 12px;
          padding: 18px 20px; margin-bottom: 20px;
        }
        .investment-roadmap-page .calc label {
          font-size: 12px; color: #65635c; display: block; margin-bottom: 8px;
        }
        .investment-roadmap-page .amount-row {
          display: flex; align-items: center; gap: 8px; margin-bottom: 14px;
        }
        .investment-roadmap-page .amount-row span.prefix { color: #9a9890; font-size: 15px; }
        .investment-roadmap-page .amount-row input {
          flex: 1; background: #0a0a09; border: 1px solid #232320; color: #f2f0e9;
          padding: 9px 10px; border-radius: 8px; font-size: 15px; font-family: inherit;
        }
        .investment-roadmap-page .amount-row input:focus { outline: 1px solid #c9974a; }
        .investment-roadmap-page .proj {
          display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0;
        }
        .investment-roadmap-page .proj .label { color: #65635c; }
        .investment-roadmap-page .proj .val { color: #8fd6a8; font-weight: 600; }
        .investment-roadmap-page .invest-btn {
          width: 100%; background: #c9974a; color: #231a0c; border: none;
          padding: 13px; border-radius: 9px; font-size: 14.5px; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: opacity 0.15s ease;
        }
        .investment-roadmap-page .invest-btn:hover { opacity: 0.9; }
        .investment-roadmap-page .invest-btn.done { background: #8fd6a8; }
        .investment-roadmap-page .toast {
          position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
          background: #111110; border: 1px solid #232320; color: #f2f0e9;
          padding: 12px 20px; border-radius: 10px; font-size: 13.5px; z-index: 60;
        }
      `}</style>

      <Navbar />
      <div className="max-w-7xl mx-auto px-8 py-10">
        <p className="font-[family-name:var(--font-display)] text-4xl mb-2">
          For you in Rwanda
        </p>
        <p className="text-sm text-[var(--color-text-muted)] mb-10">
          Ordered from lowest to highest risk.
        </p>

        <div className="inv-grid">
          {investmentOptions.map((opt) => (
            <button
              key={opt.id}
              className="inv-card"
              style={{
                background: `linear-gradient(135deg, #000000 0%, ${opt.gradientFrom}66 100%)`,
              }}
              onClick={() => openModal(opt)}
            >
              <span className="inv-level">
                Level {opt.level}
                {invested.has(opt.id) ? " ✓" : ""}
              </span>
              <div>
                <p className="inv-title">{opt.name}</p>
                <div className="inv-row">
                  <span className="label">Min. Entry</span>
                  <span className="val">{opt.minEntry}</span>
                </div>
                <div className="inv-row">
                  <span className="label">Est. Yield</span>
                  <span className="val" style={{ color: opt.yieldColor }}>
                    {opt.yieldLabel}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div
          className="overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="modal">
            <div className="modal-head">
              <span className="inv-level" style={{ color: "#9a9890" }}>
                Level {active.level} · {active.riskLabel}
              </span>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                &times;
              </button>
            </div>
            <h2>{active.name}</h2>
            <p className="desc">{active.description}</p>

            <div className="calc">
              <label htmlFor="amtInput">Amount to invest</label>
              <div className="amount-row">
                <span className="prefix">RWF</span>
                <input
                  id="amtInput"
                  type="number"
                  min={active.minEntryValue}
                  step={100}
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="proj">
                <span className="label">Minimum entry</span>
                <span className="val" style={{ color: "#f2f0e9" }}>
                  {active.minEntry}
                </span>
              </div>
              <div className="proj">
                <span className="label">Est. yield</span>
                <span className="val" style={{ color: "#f2f0e9" }}>
                  {active.yieldLabel}
                </span>
              </div>
              <div className="proj">
                <span className="label">Projected in 1 year</span>
                <span className="val">{projected}</span>
              </div>
            </div>

            <button
              className={`invest-btn ${invested.has(active.id) ? "done" : ""}`}
              onClick={handleInvest}
            >
              {invested.has(active.id) ? "Invested ✓" : active.ctaLabel}
            </button>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}