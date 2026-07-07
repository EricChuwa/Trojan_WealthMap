import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const MAX_DIGITS = 10;

function formatAmount(raw: string): string {
  if (!raw) return '0';
  return parseInt(raw, 10).toLocaleString('en-RW');
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

  const income = digits ? parseInt(digits, 10) : 0;
  const canContinue = income >= 1;

  const handleContinue = () => {
    if (!canContinue) return;
    navigate('/payday/split', { state: { income } });
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleKey('backspace');
      } else if (e.key === 'Enter' && canContinue) {
        handleContinue();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'backspace'];

  return (
    <main
      className="flex flex-col min-h-dvh max-w-[430px] mx-auto w-full relative overflow-hidden bg-obsidian"
      aria-label="Income entry"
    >

      <header className="pt-9 px-6 text-center">
        <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-text-muted mb-3.5">
          Step 1 of 2 · Payday Flow
        </p>
        <h1 className="text-[26px] font-bold leading-tight tracking-[-0.5px] text-text-primary">
          What came in<br />today?
        </h1>
      </header>


      <div
        className="mx-5 mt-5 px-5 py-3.5 rounded-2xl text-center min-h-16 flex items-center justify-center relative"
        style={{
          background: 'rgba(245, 183, 49, 0.15)',
          border: '1px solid rgba(245, 183, 49, 0.3)',
        }}
        aria-live="polite"
        aria-label={`Income amount: ${income} Rwandan Francs`}
      >
        <span className="text-sm font-semibold text-gold opacity-80 self-start mt-1 mr-1.5">
          RWF
        </span>
        <span className="text-4xl font-bold text-gold tracking-[-1px] leading-none tabular-nums">
          {formatAmount(digits)}
        </span>

        <span className="cursor-blink" aria-hidden="true" />
      </div>


      <div
        className="mt-4 mx-4 grid grid-cols-3 gap-2 flex-1"
        role="group"
        aria-label="Numeric keypad"
      >
        {numpadKeys.map((key) => (
          <button
            key={key}
            id={`numpad-${key}`}
            className={[

              'numpad-key',
              key === '0' ? 'col-span-2' : '',
              key === 'backspace' ? '!text-text-secondary' : '',
              pressed === key ? 'pressed' : '',
            ].filter(Boolean).join(' ')}
            onClick={() => handleKey(key)}
            aria-label={key === 'backspace' ? 'Delete last digit' : key}
            type="button"
          >
            {key === 'backspace' ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="w-5 h-5"
              >
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
        className="cta-btn w-[calc(100%-48px)] mx-6 mt-4 mb-7 py-3.5 px-5"
        type="button"
        disabled={!canContinue}
        onClick={handleContinue}
        aria-label={canContinue
          ? `Continue with RWF ${formatAmount(digits)}`
          : 'Enter an amount to continue'}
      >
        Continue
        <span className="arrow" aria-hidden="true">→</span>
      </button>
    </main>
  );
}
