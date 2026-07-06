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

  const cards = [
    {
      key: 'needs',
      icon: '🏠',
      label: 'Needs',
      sublabel: 'Housing, food, bills',
      pct: '50%',
      color: 'needs' as const,
      amount: alloc?.needs,
    },
    {
      key: 'wants',
      icon: '✨',
      label: 'Wants',
      sublabel: 'Dining out, hobbies',
      pct: '30%',
      color: 'wants' as const,
      amount: alloc?.wants,
    },
    {
      key: 'savings',
      icon: '🌱',
      label: 'Save & Invest',
      sublabel: 'Future building',
      pct: '20%',
      color: 'savings' as const,
      amount: alloc?.savings,
    },
  ];

  return (
    <main className="screen split-screen" aria-label="Budget split">
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

      <header className="split-header">
        <p className="step-label">Step 2 of 2 · Payday Flow</p>
        <h1>Your split</h1>
        <p className="income-subtitle">
          Based on{' '}
          <strong>RWF {formatString(income)}</strong>
          {' '}income
        </p>
      </header>

      <div className="split-bar-wrapper" aria-hidden="true">
        <div className="split-bar" role="img" aria-label="Budget allocation: 50% needs, 30% wants, 20% savings">
          <div className="split-bar-segment needs" style={{ width: '50%' }} />
          <div className="split-bar-segment wants" style={{ width: '30%' }} />
          <div className="split-bar-segment savings" style={{ width: '20%' }} />
        </div>
        <div className="split-bar-legend">
          <span className="legend-item"><span className="legend-dot needs" aria-hidden="true" />Needs 50%</span>
          <span className="legend-item"><span className="legend-dot wants" aria-hidden="true" />Wants 30%</span>
          <span className="legend-item"><span className="legend-dot savings" aria-hidden="true" />Savings 20%</span>
        </div>
      </div>

      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <div className="allocation-cards" aria-label="Budget allocations">
        {cards.map(({ key, icon, label, sublabel, pct, color, amount }) => (
          <article
            key={key}
            className={`alloc-card ${color}`}
            aria-label={`${label}: ${loading ? 'loading' : `RWF ${formatString(amount ?? 0)}`}`}
          >
            <div className="alloc-icon" aria-hidden="true">{icon}</div>

            <div className="alloc-info">
              <div className="alloc-label">{label}</div>
              <div className="alloc-sublabel">{sublabel}</div>
            </div>

            <div className="alloc-amount">
              {loading ? (
                <>
                  <div className="skeleton skeleton-amount" aria-hidden="true" />
                  <div className="skeleton skeleton-pct" aria-hidden="true" />
                </>
              ) : (
                <>
                  <div className="amount-big">
                    {formatString(amount ?? 0)}
                  </div>
                  <div className="amount-pct">{pct}</div>
                </>
              )}
            </div>
          </article>
        ))}
      </div>

      <button
        id="confirm-budget-btn"
        className="cta-btn"
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
