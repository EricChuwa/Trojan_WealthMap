import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { registerUser } from "../api/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await registerUser({
        name,
        email,
        password,
        country: "RW",
        age: 21,
        field: "",
      });
      navigate("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2">
          Create your account.
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Takes about a minute.
        </p>

        <InputField label="Full name" value={name} onChange={setName} />
        <InputField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
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
