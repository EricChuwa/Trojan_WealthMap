import { useState } from "react";
import Navbar from "../components/Navbar";

type Verdict = "red" | "amber" | "green";

const verdictStyles: Record<
  Verdict,
  { label: string; color: string; gradient: string }
> = {
  red: { label: "RED", color: "#f87171", gradient: "#8B1A1A" },
  amber: { label: "AMBER", color: "#D4A017", gradient: "#8A5A0A" },
  green: { label: "GREEN", color: "#2A9D8F", gradient: "#1B4D3E" },
};

const mockResult = {
  verdict: "red" as Verdict,
  explanation:
    'This opportunity exhibits severe hallmarks of financial fraud. Promises of "guaranteed" high returns over short periods are mathematically unsustainable. Furthermore, artificial urgency ("limited spots") is a classic psychological tactic designed to bypass critical thinking.',
  questions: [
    "Can they provide verifiable, audited third-party track records?",
    "What is the exact mechanism generating these outsized returns?",
    "Is the liquidity pool registered with any financial regulatory authority?",
  ],
  relatedQuestions: [
    {
      q: 'What does a "registered" or "licensed" investment actually mean?',
      a: "It means a real regulator — like Rwanda's Capital Market Authority — has reviewed the operator and holds them accountable. You can usually check a public register online. If an opportunity can't point to one, that's a red flag, not a technicality.",
    },
    {
      q: 'Why can\'t high returns be "guaranteed"?',
      a: "All real investments carry risk — returns move with markets. Any offer promising a fixed, high return with no risk is describing something that doesn't exist in legitimate finance. Guarantees like this are one of the most consistent signs of fraud.",
    },
    {
      q: "Where do I report a scam in Rwanda?",
      a: "You can report suspected investment fraud to the Capital Market Authority (CMA) or your local police cybercrime unit. Reporting doesn't just protect you — it can stop the same scheme from reaching others.",
    },
  ],
};

export default function SmellTest() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<typeof mockResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleAnalyze() {
    setResult(mockResult);
  }

  const v = result ? verdictStyles[result.verdict] : null;

  return (
    <div className="min-h-screen">
      <Navbar />

      {!result && (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-8">
          <div className="max-w-xl w-full text-center">
            <p className="font-[family-name:var(--font-display)] text-3xl mb-2">
              Paste the opportunity
            </p>
            <p className="text-sm text-[var(--color-text-muted)] mb-8">
              A message, a screenshot's text, a pitch someone sent you — paste
              it below.
            </p>
            <div className="flex items-end gap-3 border-b border-[var(--color-border)] focus-within:border-[var(--color-gold-light)] pb-3 transition-colors text-left">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
                placeholder="Guaranteed 20% weekly returns on crypto arbitrage via a new decentralized liquidity pool. Act fast, limited spots."
                className="flex-1 bg-transparent outline-none resize-none text-sm placeholder:text-[var(--color-text-muted)]/60"
              />
              <button
                onClick={handleAnalyze}
                className="text-[var(--color-gold-light)] pb-1"
                aria-label="Analyze"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {result && v && (
        <>
          {/* Full-bleed verdict hero — starts immediately below the nav, no gap */}
          <div className="relative w-full min-h-[380px] overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse 100% 90% at 50% 40%, ${v.gradient}99 0%, ${v.gradient}33 45%, transparent 75%)`,
              }}
            />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 min-h-[380px]">
              <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-4">
                Risk assessment
              </p>
              <p
                className="font-[family-name:var(--font-display)] text-8xl mb-6"
                style={{ color: v.color }}
              >
                {v.label}
              </p>
              <p className="text-[var(--color-text-secondary)] max-w-xl">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Investigate further */}
          <div className="px-8 py-10 max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-5">
              Investigate further
            </p>
            <div className="space-y-4 mb-10">
              {result.questions.map((q) => (
                <div
                  key={q}
                  className="flex items-start gap-3 pb-4 border-b border-[var(--color-border)]"
                >
                  <span className="mt-0.5" style={{ color: v.color }}>
                    ⚠
                  </span>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {q}
                  </p>
                </div>
              ))}
            </div>

            {/* Related questions — Google-style expandable FAQ */}
            <p className="text-xs uppercase tracking-widest text-[var(--color-text-muted)] mb-5">
              People also ask
            </p>
            <div className="space-y-0 mb-10">
              {result.relatedQuestions.map((item, i) => (
                <div
                  key={item.q}
                  className="border-b border-[var(--color-border)]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between py-4 text-left"
                  >
                    <span className="text-sm text-[var(--color-text-primary)] pr-4">
                      {item.q}
                    </span>
                    <span
                      className="text-[var(--color-text-muted)] transition-transform flex-shrink-0"
                      style={{
                        transform:
                          openFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ⌄
                    </span>
                  </button>
                  {openFaq === i && (
                    <p className="text-sm text-[var(--color-text-secondary)] pb-4 pr-8">
                      {item.a}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setResult(null);
                setInput("");
                setOpenFaq(null);
              }}
              className="px-6 py-2.5 rounded-full border border-[var(--color-border)] text-sm flex items-center gap-2"
            >
              ↻ Analyze another
            </button>
          </div>
        </>
      )}
    </div>
  );
}
