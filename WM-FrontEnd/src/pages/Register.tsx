import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../api/auth";

const countries = [
  { code: "RW", name: "Rwanda" },
  { code: "KE", name: "Kenya" },
  { code: "UG", name: "Uganda" },
  { code: "TZ", name: "Tanzania" },
  { code: "NG", name: "Nigeria" },
  { code: "GH", name: "Ghana" },
  { code: "ZA", name: "South Africa" },
  { code: "ET", name: "Ethiopia" },
  { code: "CD", name: "DR Congo" },
  { code: "CM", name: "Cameroon" },
];

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("RW");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setError("Please fill in your name, email, and password.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_number: phone || undefined,
        country: country || undefined,
        date_of_birth: dateOfBirth || undefined,
      });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2">
          Create your account.
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Takes about a minute.
        </p>

        <InputField label="First name" value={firstName} onChange={setFirstName} />
        <InputField label="Last name" value={lastName} onChange={setLastName} />
        <InputField label="Email" type="email" value={email} onChange={setEmail} />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
        />
        <InputField label="Phone number" type="tel" value={phone} onChange={setPhone} />

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-transparent border-b border-[var(--color-border)] focus:border-[var(--color-gold-light)] outline-none py-2 text-[var(--color-text-primary)] transition-colors"
          >
            {countries.map((c) => (
              <option
                key={c.code}
                value={c.code}
                className="bg-[var(--color-obsidian)] text-[var(--color-text-primary)]"
              >
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <InputField
          label="Date of birth"
          type="date"
          value={dateOfBirth}
          onChange={setDateOfBirth}
        />

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        <Button
          label={loading ? "Creating account..." : "Create account"}
          type="submit"
        />

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[var(--color-gold-light)]">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
