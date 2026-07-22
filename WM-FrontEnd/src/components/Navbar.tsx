import { Link, useLocation } from "react-router-dom";

const links = [
  { label: "Home", path: "/dashboard" },
  { label: "Budget", path: "/budget" },
  { label: "Invest", path: "/invest" },
  { label: "Goals", path: "/goals" },
  { label: "Learn", path: "/learn" },
];

export default function Navbar() {
  const location = useLocation();
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-[var(--color-border)]">
      <Link
        to="/dashboard"
        className="font-[family-name:var(--font-display)] text-xl"
      >
        Wealth<span className="text-[var(--color-gold-light)]">Map</span>
      </Link>

      <div className="flex gap-8">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm pb-1 border-b ${
              location.pathname === link.path
                ? "text-[var(--color-text-primary)] border-[var(--color-gold-light)]"
                : "text-[var(--color-text-muted)] border-transparent"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/smell-test"
          className="flex items-center gap-2 bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] text-xs font-semibold px-4 py-2 rounded-full"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Smell test
        </Link>

        <Link
          to="/health-history"
          className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center"
          aria-label="Financial health history"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-gold-light)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 12h4l2-7 4 14 2-7h6" />
          </svg>
        </Link>

        <div className="w-8 h-8 rounded-full bg-[var(--color-sapphire)] flex items-center justify-center text-xs font-medium">
          RC
        </div>
      </div>
    </nav>
  );
}
