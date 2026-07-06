import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import heroImg from "../assets/landing-hero.jpg";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background photo */}
      <img
        src={heroImg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-obsidian)] via-[var(--color-obsidian)]/70 to-[var(--color-obsidian)]/20" />

      {/* Actual content, sitting above the image */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-20 px-6 text-center">
        <h1 className="font-[var(--font-display)] text-6xl mb-3">
          Wealth<span className="text-[var(--color-gold-light)]">Map</span>
        </h1>
        <p className="text-[var(--color-text-muted)] text-lg mb-10">
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
    </div>
  );
}
