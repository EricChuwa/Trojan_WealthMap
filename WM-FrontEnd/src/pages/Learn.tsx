import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import architectureWealthImg from "../assets/architecture_of_wealth.png";
import psychologyMoneyImg from "../assets/psychology_of_money.png";
import strategicSavingImg from "../assets/strategic_saving.png";
import indexFundsImg from "../assets/index_funds.png";

function SkillCircle({
  percent,
  label,
  status,
  isLocked,
}: {
  percent: number;
  label: string;
  status: string;
  isLocked?: boolean;
}) {
  const radius = 24;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  let progressColor = "stroke-[var(--color-gold-light)]";
  if (percent > 0 && percent < 100)
    progressColor = "stroke-[var(--color-emerald-light)]";
  if (percent === 100) progressColor = "stroke-[var(--color-gold)]";

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-5 flex flex-col items-center justify-center text-center w-full aspect-square transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-gold-light/2 select-none">
      {isLocked ? (
        <div className="w-16 h-16 rounded-full bg-obsidian border border-border flex items-center justify-center text-xl text-text-muted mb-4"></div>
      ) : (
        <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              className="stroke-border/40"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius + 8}
              cy={radius + 8}
            />

            <circle
              className={`${progressColor} transition-all duration-500`}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius + 8}
              cy={radius + 8}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-mono font-bold text-text-primary">
            {percent}%
          </span>
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
      <p
        className={`text-xs ${isLocked ? "text-text-muted" : percent === 100 ? "text-gold" : "text-text-muted"}`}
      >
        {status}
      </p>
    </div>
  );
}

export default function Learn() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-obsidian text-text-primary flex flex-col font-body">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 md:px-8 py-10 w-full relative">
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--color-emerald-light)] to-[var(--color-gold)] opacity-5 blur-3xl pointer-events-none" />

        <div className="flex justify-between items-start mb-10 gap-6">
          <div>
            <h1 className="font-display text-5xl tracking-tight mb-3">Learn</h1>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base max-w-md leading-relaxed">
              Master the craft of financial wellness. Your journey to quiet
              luxury begins here.
            </p>
          </div>

          <div className="bg-card border border-border/80 rounded-xl px-5 py-3 text-right shadow-md select-none flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold mb-1">
              Financial Literacy
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xl text-[var(--color-gold-light)]">
                84%
              </span>
              <span className="text-base"></span>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-4">
            Continue Learning
          </h2>
          <div className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[320px] flex items-center p-6 md:p-10 border border-border group transition-all duration-300 hover:border-gold-light/20 shadow-xl">
            <img
              src={architectureWealthImg}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/80 to-transparent" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
              <div className="lg:col-span-8">
                <span className="bg-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase mb-4 inline-block">
                  Module 1
                </span>
                <h3 className="font-display text-3xl md:text-4xl mb-3 text-white">
                  The Architecture of Wealth
                </h3>
                <p className="text-text-muted text-xs md:text-sm max-w-lg leading-relaxed">
                  Understanding structural asset allocation and building a
                  financial foundation that withstands market volatility.
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end gap-5">
                <div className="w-full lg:max-w-[200px]">
                  <div className="flex justify-between text-xs text-text-muted mb-1.5 font-mono">
                    <span>Progress</span>
                    <span className="text-white font-semibold">67%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-gold-light)] rounded-full transition-all duration-500"
                      style={{ width: "67%" }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => {}}
                  className="bg-[var(--color-gold-light)] text-obsidian font-bold text-xs md:text-sm py-3 px-6 rounded-lg hover:bg-white hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 animate-pulse"
                >
                  <span>Resume Lesson</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-4">
            Skill Mastery
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            <SkillCircle percent={100} label="Money Basics" status="Mastered" />
            <SkillCircle percent={72} label="Saving" status="In Progress" />
            <SkillCircle percent={15} label="Investing" status="In Progress" />
            <SkillCircle percent={0} label="Taxation" status="Started" />
            <SkillCircle
              percent={0}
              label="Real Estate"
              status="Locked"
              isLocked
            />
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
              Course Catalogue
            </h2>
            <button className="text-xs text-[var(--color-gold-light)] hover:text-white font-medium transition-colors">
              View All +
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-gold-light/20 hover:shadow-md">
              <img
                src={psychologyMoneyImg}
                className="w-16 h-16 rounded-xl object-cover border border-border/50"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-lg text-text-primary truncate mb-1">
                  The Psychology of Money
                </h4>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>45 mins</span>
                  <span>•</span>
                  <span>3 Lessons</span>
                </p>
              </div>
              <div className="text-right min-w-[70px]">
                <span className="text-xs font-mono font-bold text-[var(--color-gold-light)] block mb-1">
                  100%
                </span>
                <div className="h-1 bg-border rounded-full overflow-hidden w-16 ml-auto">
                  <div
                    className="h-full bg-[var(--color-gold)] rounded-full"
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-gold-light/20 hover:shadow-md">
              <img
                src={strategicSavingImg}
                className="w-16 h-16 rounded-xl object-cover border border-border/50"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-lg text-text-primary truncate mb-1">
                  Strategic Saving
                </h4>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>1h 20m</span>
                  <span>•</span>
                  <span>5 Lessons</span>
                </p>
              </div>
              <div className="text-right min-w-[70px]">
                <span className="text-xs font-mono font-bold text-[var(--color-emerald-light)] block mb-1">
                  72%
                </span>
                <div className="h-1 bg-border rounded-full overflow-hidden w-16 ml-auto">
                  <div
                    className="h-full bg-[var(--color-emerald-light)] rounded-full"
                    style={{ width: "72%" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/80 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:border-gold-light/20 hover:shadow-md">
              <img
                src={indexFundsImg}
                className="w-16 h-16 rounded-xl object-cover border border-border/50"
                alt=""
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-lg text-text-primary truncate mb-1">
                  Index Funds & ETFs
                </h4>
                <p className="text-xs text-text-muted flex items-center gap-1.5">
                  <span>2h 15m</span>
                  <span>•</span>
                  <span>8 Lessons</span>
                </p>
              </div>
              <div className="text-right min-w-[70px]">
                <span className="text-xs font-mono font-bold text-text-muted block mb-1">
                  0%
                </span>
                <div className="h-1 bg-border rounded-full overflow-hidden w-16 ml-auto">
                  <div
                    className="h-full bg-border rounded-full"
                    style={{ width: "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-card/60 border border-border/40 rounded-xl p-4 flex items-center gap-4 select-none opacity-80">
              <div className="w-16 h-16 rounded-xl bg-obsidian/60 border border-border/50 flex items-center justify-center text-xl text-text-muted"></div>
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-lg text-text-muted truncate mb-1">
                  Advanced Tax Strategies
                </h4>
                <p className="text-xs text-text-muted">3h 10m · Masterclass</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-border text-text-muted">
                  Locked
                </span>
              </div>
            </div>

            <div
              onClick={() => navigate("/scams")}
              className="bg-card border border-amber-500/20 hover:border-amber-500/40 rounded-xl p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5 cursor-pointer md:col-span-2 group"
            >
              <div className="w-16 h-16 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-center justify-center text-3xl group-hover:scale-105 transition-transform"></div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-0.5">
                  Security Layer
                </span>
                <h4 className="font-display text-xl text-text-primary mb-1">
                  Staying Safe & Spotting Scams
                </h4>
                <p className="text-xs text-text-muted">
                  Learn to recognize real scam tactics, mobile money fraud, and
                  red flags.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-obsidian transition-all flex items-center gap-1">
                  <span>Safety Alerts</span>
                  <span></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
