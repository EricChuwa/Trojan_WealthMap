interface InputFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}

export default function InputField({
  label,
  type = "text",
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="mb-6">
      <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-[var(--color-border)] focus:border-[var(--color-gold-light)] outline-none py-2 text-[var(--color-text-primary)] transition-colors"
      />
    </div>
  );
}
