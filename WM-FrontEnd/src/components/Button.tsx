interface ButtonProps {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "outline";
}

export default function Button({
  label,
  onClick,
  type = "button",
  variant = "primary",
}: ButtonProps) {
  const base = "w-full py-3 rounded-full font-medium transition-colors";
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)]"
      : "border border-[var(--color-border)] text-[var(--color-text-primary)]";
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles}`}>
      {label}
    </button>
  );
}
