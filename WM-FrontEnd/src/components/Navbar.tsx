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
      <p className="font-[var(--font-display)] text-xl">WealthMap</p>
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
      <div className="flex items-center gap-6">
        <Link
          to="/scams"
          className="text-xs md:text-sm text-[var(--color-gold-light)] hover:text-white px-3 py-1.5 rounded-lg border border-[var(--color-gold-light)]/20 hover:border-[var(--color-gold-light)]/50 transition-all flex items-center gap-1.5"
        >
          <span>Smell test</span>
          <span>🛡️</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-sapphire)] to-[var(--color-emerald)] border border-[var(--color-border)] flex items-center justify-center text-xs font-semibold text-white shadow-md">
          RC
        </div>
      </div>
    </nav>
  );
}
