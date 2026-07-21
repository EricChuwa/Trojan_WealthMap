import { useState } from "react";
import Navbar from "../components/Navbar";

const API_URL = import.meta.env.VITE_API_URL;

interface SmellTestResult {
  risk: "GREEN" | "AMBER" | "RED";
  summary: string;
  questions: string[];
}

async function analyzeSmellTest(text: string): Promise<SmellTestResult> {
  const res = await fetch(`${API_URL}/smell-test`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Analysis failed");
  }
  const data = await res.json();
  return data as SmellTestResult;
}

const RISK_META: Record<
  SmellTestResult["risk"],
  { className: string; icon: JSX.Element }
> = {
  RED: {
    className: "",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginTop: 2 }}>
        <path d="M12 3.5L21.5 20h-19L12 3.5z" />
        <path d="M12 10v4" />
        <path d="M12 17h.01" />
      </svg>
    ),
  },
  AMBER: {
    className: "caution",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginTop: 2 }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16h.01" />
      </svg>
    ),
  },
  GREEN: {
    className: "ok",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginTop: 2 }}>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 12.5l2.5 2.5 5-5" />
      </svg>
    ),
  },
};

export default function SmellTest() {
  const [input, setInput] = useState(
    "Guaranteed 20% weekly returns on crypto arbitrage via a new decentralized liquidity pool. Act fast, limited spots."
  );
  const [result, setResult] = useState<SmellTestResult | null>(null);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeSmellTest(text);
      setResult(res);
      requestAnimationFrame(() => setShow(true));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function handleAgain() {
    setShow(false);
    setTimeout(() => {
      setResult(null);
      setInput("");
    }, 350);
  }

  const meta = result ? RISK_META[result.risk] : null;

  return (
    <div className="smell-test-page">
      <style>{`
        .smell-test-page {
          --bg: #0a0a0b;
          --card-bg: #17171a;
          --border: rgba(255,255,255,0.08);
          --border-strong: rgba(255,255,255,0.14);
          --text: #f2efec;
          --text-dim: #a9a6a1;
          --text-dimmer: #77746f;
          --accent: #d99a63;
          --accent-soft: rgba(217,154,99,0.12);
          --danger: #e2897c;
          --ok: #8fbf9f;
          --line-blue: #5b93ef;
          --serif: Georgia, 'Iowan Old Style', 'Palatino Linotype', 'Times New Roman', serif;
          background: var(--bg);
          color: var(--text);
          font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
        }
        .smell-test-page .topline {
          height: 2px; width: 100%;
          background: linear-gradient(90deg, transparent 0%, var(--line-blue) 50%, transparent 100%);
        }
        .smell-test-page main {
          display: flex; justify-content: center;
          padding: 64px 24px 90px;
        }
        .smell-test-page .wrap { width: 100%; max-width: 560px; }
        .smell-test-page h1 {
          font-family: var(--serif); font-weight: 400; font-size: 2.1rem;
          margin: 0 0 14px; text-wrap: balance;
        }
        .smell-test-page .lede {
          color: var(--text-dim); font-size: 0.98rem; line-height: 1.55;
          margin: 0 0 40px; max-width: 46ch;
        }
        .smell-test-page form.paste {
          display: flex; align-items: flex-end; gap: 14px;
          border-bottom: 1px solid var(--border-strong);
          padding-bottom: 14px; margin-bottom: 48px;
        }
        .smell-test-page .paste textarea {
          flex: 1; background: none; border: none; color: var(--text);
          font-family: inherit; font-size: 0.98rem; line-height: 1.5;
          resize: none; outline: none; min-height: 24px; max-height: 160px; overflow-y: auto;
        }
        .smell-test-page .paste textarea::placeholder { color: var(--text-dimmer); }
        .smell-test-page .send-btn {
          background: none; border: none; color: var(--accent); cursor: pointer;
          padding: 4px; display: flex; align-items: center;
          transition: transform 0.15s ease, opacity 0.15s ease; flex-shrink: 0;
        }
        .smell-test-page .send-btn:hover { transform: translateX(2px); }
        .smell-test-page .send-btn:disabled { opacity: 0.35; cursor: default; transform: none; }
        .smell-test-page .card {
          background: var(--card-bg); border: 1px solid var(--border);
          border-radius: 14px; padding: 44px 40px 36px; text-align: center;
          opacity: 0; transform: translateY(6px);
          transition: opacity 0.35s ease, transform 0.35s ease;
        }
        .smell-test-page .card.show { opacity: 1; transform: translateY(0); }
        .smell-test-page .verdict-label {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em;
          color: var(--accent); margin-bottom: 14px;
        }
        .smell-test-page .verdict {
          font-family: var(--serif); font-size: 3rem; line-height: 1;
          margin: 0 0 22px; color: var(--danger);
        }
        .smell-test-page .verdict.ok { color: var(--ok); }
        .smell-test-page .verdict.caution { color: var(--accent); }
        .smell-test-page .summary {
          color: var(--text-dim); font-size: 0.94rem; line-height: 1.65;
          max-width: 40ch; margin: 0 auto 30px;
        }
        .smell-test-page .investigate {
          text-align: left; padding-top: 22px; border-top: 1px solid var(--border);
        }
        .smell-test-page .investigate h2 {
          font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
          color: var(--text-dim); margin: 0 0 16px;
        }
        .smell-test-page .investigate ul {
          list-style: none; margin: 0 0 30px; padding: 0;
          display: flex; flex-direction: column; gap: 12px;
        }
        .smell-test-page .investigate li {
          display: flex; gap: 10px; align-items: flex-start;
          color: var(--text-dim); font-size: 0.9rem; line-height: 1.5;
        }
        .smell-test-page .investigate svg { flex-shrink: 0; color: var(--danger); }
        .smell-test-page .investigate.ok svg { color: var(--ok); }
        .smell-test-page .investigate.caution svg { color: var(--accent); }
        .smell-test-page .again-btn {
          background: none; border: 1px solid var(--border-strong); color: var(--text);
          font-family: inherit; font-size: 0.88rem; padding: 10px 22px; border-radius: 999px;
          display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
        }
        .smell-test-page .again-btn:hover { border-color: var(--text-dim); background: rgba(255,255,255,0.03); }
        .smell-test-page .error-msg { color: var(--danger); font-size: 0.9rem; margin-bottom: 24px; }
        @media (max-width: 560px) {
          .smell-test-page main { padding: 44px 16px 60px; }
          .smell-test-page .card { padding: 34px 22px 28px; }
          .smell-test-page .verdict { font-size: 2.4rem; }
        }
      `}</style>

      <div className="topline"></div>
      <Navbar />

      <main>
        <div className="wrap">
          <h1>Paste the opportunity</h1>
          <p className="lede">
            Drop in the message, DM, or listing verbatim. We'll flag the manipulation patterns before your money does.
          </p>

          <form className="paste" onSubmit={handleSubmit}>
            <textarea
              rows={1}
              placeholder="Paste the pitch, offer, or message here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button type="submit" className="send-btn" disabled={loading || !input.trim()} aria-label="Analyze">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 11.5L20.5 4l-6.8 17-3.1-7.6L3 11.5z" />
              </svg>
            </button>
          </form>

          {error && <p className="error-msg">{error}</p>}

          {result && meta && (
            <div className={`card ${show ? "show" : ""}`}>
              <div className="verdict-label">RISK ASSESSMENT</div>
              <div className={`verdict ${meta.className}`}>{result.risk}</div>
              <p className="summary">{result.summary}</p>

              <div className={`investigate ${meta.className}`}>
                <h2>Investigate Further</h2>
                <ul>
                  {result.questions.map((q, i) => (
                    <li key={i}>
                      {meta.icon}
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
                <button className="again-btn" onClick={handleAgain}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 0115.3-6.4M21 12a9 9 0 01-15.3 6.4" />
                    <path d="M3 4v5h5M21 20v-5h-5" />
                  </svg>
                  Analyze Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
