import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Allocations {
  needs: number;
  wants: number;
  savings: number;
}

interface BudgetResponse {
  budgetId: number;
  allocations: Allocations;
}

function mockPostBudget(income: number): Promise<BudgetResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        budgetId: Math.floor(Math.random() * 1000) + 1,
        allocations: {
          needs: Math.round(income * 0.50),
          wants: Math.round(income * 0.30),
          savings: Math.round(income * 0.20),
        },
      });
    }, 650);
  });
}

function formatString(n: number): string {
  return n.toLocaleString('en-RW');
}

type CardColor = 'needs' | 'wants' | 'savings';


const CARD_STYLES: Record<CardColor, {
  borderColor: string;
  gradientFrom: string;
  iconBg: string;
  amountClass: string;
  barClass: string;
  dotClass: string;
}> = {
  needs: {
    borderColor: 'rgba(245, 183, 49, 0.25)',
    gradientFrom: 'rgba(245, 183, 49, 0.12)',
    iconBg: 'rgba(245, 183, 49, 0.12)',
    amountClass: 'text-needs',
    barClass: 'bg-needs',
    dotClass: 'bg-needs',
  },
  wants: {
    borderColor: 'rgba(46, 196, 182, 0.25)',
    gradientFrom: 'rgba(46, 196, 182, 0.12)',
    iconBg: 'rgba(46, 196, 182, 0.12)',
    amountClass: 'text-wants',
    barClass: 'bg-wants',
    dotClass: 'bg-wants',
  },
  savings: {
    borderColor: 'rgba(107, 203, 119, 0.25)',
    gradientFrom: 'rgba(107, 203, 119, 0.12)',
    iconBg: 'rgba(107, 203, 119, 0.12)',
    amountClass: 'text-savings',
    barClass: 'bg-savings',
    dotClass: 'bg-savings',
  },
};

export default function SplitScreen() {
  const navigate = useNavigate();
  const location = useLocation();

  const income: number = (location.state as { income?: number })?.income ?? 0;

  const noIncomeError = !income
    ? 'No income value found. Please go back and enter your income.'
    : null;

  const [loading, setLoading] = useState(!noIncomeError);
  const [error, setError] = useState<string | null>(noIncomeError);
  const [data, setData] = useState<BudgetResponse | null>(null);

  useEffect(() => {
    if (!income) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await mockPostBudget(income);
        if (!cancelled) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong.');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [income]);

  const alloc = data?.allocations;

  const cards: { key: CardColor; icon: string; label: string; sublabel: string; pct: string; barWidth: string; amount?: number }[] = [
    { key: 'needs', icon: '🏠', label: 'Needs', sublabel: 'Housing, food, bills', pct: '50%', barWidth: '50%', amount: alloc?.needs },
    { key: 'wants', icon: '✨', label: 'Wants', sublabel: 'Dining out, hobbies', pct: '30%', barWidth: '30%', amount: alloc?.wants },
    { key: 'savings', icon: '🌱', label: 'Save & Invest', sublabel: 'Future building', pct: '20%', barWidth: '20%', amount: alloc?.savings },
  ];

  return (
    <main
      className="flex flex-col min-h-dvh max-w-[430px] mx-auto w-full relative overflow-hidden bg-obsidian"
      aria-label="Budget split"
    >

      <button
        className="back-btn"
        type="button"
        onClick={() => navigate(-1)}
        aria-label="Go back to income entry"
        id="back-btn"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>


      <header className="pt-11 px-6 text-center">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3.5">
          Step 2 of 2 · Payday Flow
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.5px] text-text-primary mb-1">
          Your split
        </h1>
        <p className="text-sm text-text-secondary">
          Based on{' '}
          <strong className="text-gold font-semibold">RWF {formatString(income)}</strong>
          {' '}income
        </p>
      </header>


      <div className="mx-6 mt-5" aria-hidden="true">
        <div
          className="h-2.5 rounded-full flex overflow-hidden gap-0.5 bg-card"
          role="img"
          aria-label="Budget allocation: 50% needs, 30% wants, 20% savings"
        >
          {cards.map(({ key, barWidth }) => (
            <div
              key={key}
              className={`h-full rounded-full transition-[width] duration-700 ${CARD_STYLES[key].barClass}`}
              style={{ width: barWidth }}
            />
          ))}
        </div>

        <div className="flex gap-5 mt-2.5 justify-center">
          {cards.map(({ key, label, pct }) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-text-secondary">
              <span className={`w-2 h-2 rounded-full ${CARD_STYLES[key].dotClass}`} aria-hidden="true" />
              {label} {pct}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div
          className="mx-6 mt-4 px-4 py-3.5 rounded-xl text-[13px] text-red-400 text-center"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
          }}
          role="alert"
        >
          {error}
        </div>
      )}


      <div className="flex flex-col gap-2.5 mx-5 mt-4" aria-label="Budget allocations">
        {cards.map(({ key, icon, label, sublabel, pct, amount }, i) => {
          const s = CARD_STYLES[key];
          return (
            <article
              key={key}
              className="rounded-2xl p-3.5 flex items-center gap-3"
              style={{
                background: `linear-gradient(135deg, ${s.gradientFrom}, var(--color-card))`,
                border: `1px solid ${s.borderColor}`,
                animation: `card-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + i * 0.07}s both`,
              }}
              aria-label={`${label}: ${loading ? 'loading' : `RWF ${formatString(amount ?? 0)}`}`}
            >

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: s.iconBg }}
                aria-hidden="true"
              >
                {icon}
              </div>


              <div className="flex-1">
                <div className="text-sm font-semibold text-text-primary mb-0.5">{label}</div>
                <div className="text-xs text-text-secondary">{sublabel}</div>
              </div>


              <div className="text-right">
                {loading ? (
                  <>

                    <div className="skeleton h-8 w-28 rounded-lg mb-1.5" aria-hidden="true" />
                    <div className="skeleton h-3 w-9 rounded ml-auto" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <div className={`text-lg font-bold tracking-tight leading-none tabular-nums ${s.amountClass}`}>
                      {formatString(amount ?? 0)}
                    </div>
                    <div className="text-[11px] text-text-muted mt-0.5 text-right">{pct}</div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>


      <button
        id="confirm-budget-btn"
        className="cta-btn w-[calc(100%-48px)] mx-6 mt-4 mb-7 py-3.5 px-5"
        type="button"
        disabled={loading || !!error}
        aria-label="Confirm and save this budget split"
        onClick={() => {
          alert(`Budget confirmed! ID: ${data?.budgetId ?? '—'}`);
        }}
      >
        Confirm Budget
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </main>
  );
}
