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
        <div className="w-8 h-8 rounded-full border border-[var(--color-border)] flex items-center justify-center text-xs">
          🛡
        </div>
        <div className="w-8 h-8 rounded-full bg-[var(--color-sapphire)]" />
      </div>
    </nav>
  );
}