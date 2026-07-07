import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_DIGITS = 10;

function formatAmount(raw: string): string {
  if (!raw) return '0';
  const num = parseInt(raw, 10);
  return num.toLocaleString('en-RW');
}

export default function IncomeEntryScreen() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState('');
  const [pressed, setPressed] = useState<string | null>(null);

  const handleKey = useCallback((key: string) => {
    setPressed(key);
    setTimeout(() => setPressed(null), 120);

    if (key === 'backspace') {
      setDigits(d => d.slice(0, -1));
      return;
    }
    if (digits === '' && key === '0') return;
    if (digits.length >= MAX_DIGITS) return;
    setDigits(d => d + key);
  }, [digits]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleKey('backspace');
      } else if (e.key === 'Enter') {
        if (canContinue) handleContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const income = digits ? parseInt(digits, 10) : 0;
  const canContinue = income >= 1;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/payday/split', { state: { income } });
  };

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace'];

  return (
    <main className="screen income-screen" aria-label="Income entry">
      <header className="income-header">
        <p className="step-label">Step 1 of 2 · Payday Flow</p>
        <h1>What came in<br />today?</h1>
      </header>
      <div
        className="amount-display"
        aria-live="polite"
        aria-label={`Income amount: ${income} Rwandan Francs`}
      >
        <span className="currency-label">RWF</span>
        <span className="amount-value">{formatAmount(digits)}</span>
        <span className="cursor-blink" aria-hidden="true" />
      </div>
      <div
        className="numpad"
        role="group"
        aria-label="Numeric keypad"
      >
        {numpadKeys.map((key) => (
          <button
            key={key}
            id={`numpad-${key}`}
            className={[
              'numpad-key',
              key === '0' ? 'zero' : '',
              key === 'backspace' ? 'backspace' : '',
              pressed === key ? 'pressed' : '',
            ].join(' ').trim()}
            onClick={() => handleKey(key)}
            aria-label={key === 'backspace' ? 'Delete last digit' : key}
            type="button"
          >
            {key === 'backspace' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                <line x1="18" y1="9" x2="12" y2="15" />
                <line x1="12" y1="9" x2="18" y2="15" />
              </svg>
            ) : key}
          </button>
        ))}
      </div>

      <button
        id="continue-btn"
        className="cta-btn"
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
        aria-label={canContinue ? `Continue with RWF ${formatAmount(digits)}` : 'Enter an amount to continue'}
      >
        Continue
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </main>
  );
}
