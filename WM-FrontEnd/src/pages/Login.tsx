import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { loginUser } from "../api/auth";

export default function Login() {
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
      await loginUser(email, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="font-[var(--font-display)] text-4xl mb-2">
          Welcome back.
        </h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Let's pick up where you left off.
        </p>

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

        <Button label={loading ? "Signing in..." : "Sign in"} type="submit" />

        <p className="text-center text-sm text-[var(--color-text-muted)] mt-6">
          New to WealthMap?{" "}
          <Link to="/register" className="text-[var(--color-gold-light)]">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}
