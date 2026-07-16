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
      <p className="font-[family-name:var(--font-display)] text-xl">
        Wealth<span className="text-[var(--color-gold-light)]">Map</span>
      </p>
      <div className="flex gap-8">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`text-sm pb-1 border-b ${
              location.pathname === link.path ||
              (link.path === "/learn" && location.pathname === "/scams")
                ? "text-[var(--color-text-primary)] border-[var(--color-gold-light)]"
                : "text-[var(--color-text-muted)] border-transparent"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] px-3 py-1.5 rounded-lg border border-[var(--color-border)]/40 select-none cursor-default">
          <span>Smell test</span>
          <span className="text-base">🔍</span>
          <span className="text-base">🛡️</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-sapphire)] to-[var(--color-emerald)] border border-[var(--color-border)] flex items-center justify-center text-xs font-semibold text-white shadow-md">
          RC
        </div>
      </div>
    </nav>
  );
}
