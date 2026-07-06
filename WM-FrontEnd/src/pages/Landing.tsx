import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="font-[var(--font-display)] text-5xl mb-2">
        Wealth<span className="text-[var(--color-gold-light)]">Map</span>
      </h1>
      <p className="text-[var(--color-text-muted)] mb-10">
        Your money, decided with dignity.
      </p>
      <div className="w-full max-w-xs space-y-3">
        <Button label="Get started" onClick={() => navigate("/register")} />
        <Button
          label="I already have an account"
          variant="outline"
          onClick={() => navigate("/login")}
        />
      </div>
    </div>
  );
}
