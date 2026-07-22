import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/auth";
import loginPortrait from "../assets/login-portrait.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="grid grid-cols-[55%_45%] min-h-screen bg-[var(--color-obsidian)] text-[var(--color-text-primary)]">
      {/* ===== LEFT: FORM ===== */}
      <div className="flex flex-col px-16 py-10">
        <div className="flex items-center justify-between mb-16">
          <button
            onClick={() => navigate("/")}
            className="text-[var(--color-text-muted)]"
          >
            ←
          </button>
          <p className="font-[family-name:var(--font-display)] text-lg">
            Wealth<span className="text-[var(--color-gold-light)]">Map</span>
          </p>
          <span className="w-4" />
        </div>

        <div className="max-w-sm w-full mx-auto">
          <h1 className="font-[family-name:var(--font-display)] text-4xl mb-2">
            Welcome back.
          </h1>
          <p className="text-[var(--color-text-muted)] mb-10">
            Let's pick up where you left off.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--color-border)] focus:border-[var(--color-gold-light)] outline-none py-2 placeholder:text-[var(--color-text-muted)]/50 transition-colors"
              />
            </div>

            <div className="mb-2">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-[var(--color-gold-light)]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-b border-[var(--color-border)] focus:border-[var(--color-gold-light)] outline-none py-2 transition-colors"
              />
            </div>

            <div className="text-right mb-8">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--color-text-muted)]"
              >
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-full font-medium bg-gradient-to-r from-[var(--color-gold-light)] to-[var(--color-gold)] text-[var(--color-obsidian)] mb-6"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="relative text-center mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-border)]" />
              </div>
              <span className="relative bg-[var(--color-obsidian)] px-3 text-xs text-[var(--color-text-muted)]">
                OR
              </span>
            </div>

            <button
              type="button"
              className="w-full py-3 rounded-full border border-[var(--color-border)] flex items-center justify-center gap-2 text-sm mb-8"
            >
              <span className="text-[var(--color-gold-light)] font-bold">
                G
              </span>
              Continue with Google
            </button>
          </form>

          <p className="text-center text-sm text-[var(--color-text-muted)]">
            New to WealthMap?{" "}
            <Link to="/register" className="text-[var(--color-gold-light)]">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* ===== RIGHT: PHOTO ===== */}
      <div className="relative">
        <img
          src={loginPortrait}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[var(--color-obsidian)]/40" />
        <div className="absolute bottom-8 left-8 text-xs text-[var(--color-text-muted)] tracking-widest uppercase">
          <p>Artisanal Finance</p>
          <p className="text-[var(--color-gold-light)]">Est. 2026</p>
        </div>
      </div>
    </div>
  );
}
