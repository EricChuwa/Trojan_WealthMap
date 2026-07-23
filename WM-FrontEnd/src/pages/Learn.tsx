import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import architectureWealthImg from "../assets/architecture_of_wealth.png";
import psychologyMoneyImg from "../assets/psychology_of_money.png";
import strategicSavingImg from "../assets/strategic_saving.png";
import indexFundsImg from "../assets/index_funds.png";

// Types
interface Lesson {
  id: number;
  title: string;
  duration: string;
  completed: boolean;
  content: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Course {
  id: string;
  title: string;
  category: "Fundamentals" | "Investing" | "Safety & Scams" | "Tax & Strategy";
  description: string;
  image?: string;
  duration: string;
  totalLessons: number;
  progress: number;
  isLocked?: boolean;
  isSecurityLayer?: boolean;
  moduleNumber?: string;
  lessons: Lesson[];
  quiz?: QuizQuestion;
}

// Initial Data
const INITIAL_COURSES: Course[] = [
  {
    id: "architecture-wealth",
    title: "The Architecture of Wealth",
    category: "Fundamentals",
    moduleNumber: "Module 1",
    image: architectureWealthImg,
    duration: "1h 45m",
    totalLessons: 6,
    progress: 67,
    description:
      "Understanding structural asset allocation and building a financial foundation that withstands market volatility.",
    lessons: [
      {
        id: 1,
        title: "Foundations of Net Worth & Balance Sheets",
        duration: "15 mins",
        completed: true,
        content:
          "Your net worth is your financial compass. Learn how to calculate assets vs liabilities and structure your primary accounts for cash flow clarity.",
      },
      {
        id: 2,
        title: "Asset Allocation & Risk Profiling",
        duration: "20 mins",
        completed: true,
        content:
          "Diversification across asset classes (equities, bonds, real estate, cash) protects against market volatility while capitalizing on long-term compound growth.",
      },
      {
        id: 3,
        title: "Liquidity vs Illiquidity Reserves",
        duration: "18 mins",
        completed: true,
        content:
          "Maintaining the optimal balance between accessible emergency liquid reserves and illiquid yield-generating capital.",
      },
      {
        id: 4,
        title: "Building Emergency Reserves (3-6 Months)",
        duration: "22 mins",
        completed: true,
        content:
          "Step-by-step framework to calculate true monthly living expenses and fund a high-yield liquid emergency cushion.",
      },
      {
        id: 5,
        title: "Portfolio Rebalancing Strategies",
        duration: "15 mins",
        completed: false,
        content:
          "Automating annual or quarterly target rebalancing to lock in gains and maintain your desired risk tolerance.",
      },
      {
        id: 6,
        title: "Legacy & Generational Wealth Transfer",
        duration: "15 mins",
        completed: false,
        content:
          "Introduction to estate planning, trusts, and sustainable wealth transfer structures for long-term multi-generational growth.",
      },
    ],
    quiz: {
      question:
        "What is the primary purpose of strategic asset allocation in a portfolio?",
      options: [
        "To maximize short-term speculative trading profits",
        "To balance risk and return based on goals, timeline, and risk tolerance",
        "To avoid paying taxes completely on earned income",
        "To hold 100% of wealth in high-volatility cryptocurrencies",
      ],
      correctAnswer: 1,
      explanation:
        "Asset allocation distributes investments across broad asset classes to optimize risk-adjusted returns according to individual timelines and tolerance.",
    },
  },
  {
    id: "psychology-money",
    title: "The Psychology of Money",
    category: "Fundamentals",
    image: psychologyMoneyImg,
    duration: "45 mins",
    totalLessons: 3,
    progress: 100,
    description:
      "Explore behavioral finance, emotional triggers, and how human behavior shapes long-term financial success.",
    lessons: [
      {
        id: 1,
        title: "Mindsets of Scarcity vs Abundance",
        duration: "15 mins",
        completed: true,
        content:
          "Understanding cognitive biases around spending and rewiring your relationship with earned money.",
      },
      {
        id: 2,
        title: "Overcoming Fear & Greed in Market Cycles",
        duration: "15 mins",
        completed: true,
        content:
          "Why emotional discipline outperforms market timing in virtually every decade of historical market data.",
      },
      {
        id: 3,
        title: "The Power of Compounding & Patience",
        duration: "15 mins",
        completed: true,
        content:
          "Patience is the ultimate financial edge. Small consistent habits compound exponentially over long horizons.",
      },
    ],
    quiz: {
      question:
        "Which behavioral tendency is most damaging to long-term investor returns?",
      options: [
        "Buying index funds during market dips",
        "Panic selling at market bottoms due to fear",
        "Automating monthly savings transfers",
        "Maintaining a 6-month liquid emergency fund",
      ],
      correctAnswer: 1,
      explanation:
        "Panic selling during market declines converts paper losses into permanent capital losses and misses key recovery periods.",
    },
  },
  {
    id: "strategic-saving",
    title: "Strategic Saving",
    category: "Fundamentals",
    image: strategicSavingImg,
    duration: "1h 20m",
    totalLessons: 5,
    progress: 72,
    description:
      "Master budget split models (50/30/20 rule), high-yield saving, and automating your wealth transfers.",
    lessons: [
      {
        id: 1,
        title: "The 50/30/20 Budgeting Matrix",
        duration: "15 mins",
        completed: true,
        content:
          "Allocate 50% to essential Needs, 30% to personal Wants, and 20% directly into Savings & Investments.",
      },
      {
        id: 2,
        title: "Automating Your Payday Wealth Split",
        duration: "15 mins",
        completed: true,
        content:
          "Remove willpower from saving by setting up instant payday split rules to dedicated sub-accounts.",
      },
      {
        id: 3,
        title: "High-Yield Savings Accounts vs Inflation",
        duration: "18 mins",
        completed: true,
        content:
          "How to ensure cash reserves yield competitive interest rates rather than losing purchasing power to inflation.",
      },
      {
        id: 4,
        title: "Sinking Funds for Major Milestones",
        duration: "16 mins",
        completed: false,
        content:
          "Create targeted sub-accounts for planned upcoming expenses without depleting primary emergency funds.",
      },
      {
        id: 5,
        title: "Frugality vs Value-Based Spending",
        duration: "16 mins",
        completed: false,
        content:
          "Optimize spending by eliminating low-value subscriptions while freely spending on items that bring real utility.",
      },
    ],
  },
  {
    id: "index-funds",
    title: "Index Funds & ETFs",
    category: "Investing",
    image: indexFundsImg,
    duration: "2h 15m",
    totalLessons: 8,
    progress: 0,
    description:
      "Demystifying passive investing, low-cost index tracking, diversification, and dollar-cost averaging.",
    lessons: [
      {
        id: 1,
        title: "What is an Index Fund?",
        duration: "15 mins",
        completed: false,
        content:
          "An index fund buys shares of all companies in a market benchmark, instantly providing broad diversification.",
      },
      {
        id: 2,
        title: "Expense Ratios & Fee Compression",
        duration: "15 mins",
        completed: false,
        content:
          "Why paying 0.03% vs 1.5% in fund fees saves hundreds of thousands of dollars over an investing career.",
      },
      {
        id: 3,
        title: "S&P 500 vs Total Market Index Funds",
        duration: "20 mins",
        completed: false,
        content:
          "Comparing large-cap concentration with total stock market diversification across market caps.",
      },
      {
        id: 4,
        title: "Dollar-Cost Averaging (DCA) Mechanics",
        duration: "18 mins",
        completed: false,
        content:
          "Investing fixed dollar amounts on a regular schedule regardless of short-term market price fluctuations.",
      },
    ],
  },
  {
    id: "tax-strategies",
    title: "Advanced Tax Strategies",
    category: "Tax & Strategy",
    duration: "3h 10m",
    totalLessons: 7,
    progress: 0,
    isLocked: true,
    description:
      "Master tax-advantaged accounts, deduction optimization, tax-loss harvesting, and wealth preservation.",
    lessons: [],
  },
  {
    id: "security-scams",
    title: "Staying Safe & Spotting Scams",
    category: "Safety & Scams",
    duration: "Security Layer",
    totalLessons: 5,
    progress: 100,
    isSecurityLayer: true,
    description:
      "Learn to recognize real scam tactics, mobile money fraud, fake loan apps, and high-urgency red flags.",
    lessons: [],
  },
];

const SKILL_ITEMS = [
  { id: "basics", label: "Money Basics", percent: 100, status: "Mastered", color: "gold" },
  { id: "saving", label: "Saving", percent: 72, status: "In Progress", color: "emerald" },
  { id: "investing", label: "Investing", percent: 15, status: "In Progress", color: "sapphire" },
  { id: "taxation", label: "Taxation", percent: 0, status: "Started", color: "gold-light" },
  { id: "real-estate", label: "Real Estate", percent: 0, status: "Locked", isLocked: true, color: "muted" },
];



function SkillCircle({
  percent,
  label,
  status,
  isLocked,
  onClick,
  isSelected,
}: {
  percent: number;
  label: string;
  status: string;
  isLocked?: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const radius = 26;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  let progressColor = "stroke-[var(--color-gold-light)]";
  if (percent > 0 && percent < 100) progressColor = "stroke-[var(--color-emerald-light)]";
  if (percent === 100) progressColor = "stroke-[var(--color-gold)]";

  return (
    <div
      onClick={onClick}
      className={`bg-card border ${
        isSelected
          ? "border-[var(--color-gold-light)] ring-2 ring-[var(--color-gold-light)]/20 bg-card/90"
          : "border-border/80 hover:border-gold-light/40"
      } rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center text-center w-full aspect-square transition-all duration-300 hover:shadow-xl cursor-pointer select-none group relative overflow-hidden`}
    >
      {isLocked ? (
        <div className="w-14 h-14 rounded-full bg-obsidian border border-border flex items-center justify-center text-lg text-text-muted mb-3 group-hover:scale-105 transition-transform">
          <svg className="w-6 h-6 text-text-muted/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
      ) : (
        <div className="relative w-14 h-14 mb-3 flex items-center justify-center group-hover:scale-105 transition-transform">
          <svg className="w-full h-full -rotate-90">
            <circle
              className="stroke-border/40"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius + 3}
              cy={radius + 3}
            />
            <circle
              className={`${progressColor} transition-all duration-700 ease-out`}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + " " + circumference}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius + 3}
              cy={radius + 3}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute text-xs font-mono font-bold text-text-primary">
            {percent}%
          </span>
        </div>
      )}
      <p className="text-xs md:text-sm font-semibold text-text-primary mb-1 line-clamp-1">{label}</p>
      <span
        className={`text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full ${
          isLocked
            ? "bg-obsidian text-text-muted"
            : percent === 100
            ? "bg-[var(--color-gold)]/15 text-[var(--color-gold-light)] border border-[var(--color-gold)]/30"
            : "bg-[var(--color-emerald-light)]/15 text-[var(--color-emerald-light)] border border-[var(--color-emerald-light)]/30"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

export default function Learn() {
  const navigate = useNavigate();

  // State
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCourseModal, setActiveCourseModal] = useState<Course | null>(null);
  const [modalTab, setModalTab] = useState<"outline" | "quiz">("outline");
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [pageTab, setPageTab] = useState<"courses" | "progress">("courses");

  const streakCount = 7;

  const featuredCourse = courses.find((c) => c.id === "architecture-wealth") || courses[0];

  
  const filteredCourses = courses.filter((course) => {
    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "In Progress" && course.progress > 0 && course.progress < 100) ||
      (selectedCategory === "Mastered" && course.progress === 100) ||
      course.category === selectedCategory;

    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleToggleLesson = (courseId: string, lessonId: number) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        const updatedLessons = c.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: !l.completed } : l
        );
        const completedCount = updatedLessons.filter((l) => l.completed).length;
        const newProgress = Math.round((completedCount / updatedLessons.length) * 100);

        const updatedCourse = {
          ...c,
          lessons: updatedLessons,
          progress: newProgress,
        };

        if (activeCourseModal?.id === courseId) {
          setActiveCourseModal(updatedCourse);
        }

        return updatedCourse;
      })
    );
  };

  // Open Modal
  const handleOpenCourse = (course: Course) => {
    if (course.isSecurityLayer) {
      navigate("/scams");
      return;
    }
    setActiveCourseModal(course);
    setModalTab("outline");
    setSelectedQuizOption(null);
    setQuizAnswered(false);
  };

  return (
    <div className="min-h-screen bg-obsidian text-text-primary flex flex-col font-body selection:bg-gold-light/20 selection:text-gold-light">
      <Navbar />

      {/* ── STREAK BAR ── */}
      <div className="border-b border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center justify-end gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4 text-[var(--color-gold-light)]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
              </svg>
              <span className="font-semibold text-text-primary">{streakCount} Day Streak</span>
            </span>
            <span className="text-text-muted/30">|</span>
            <span className="text-sm text-text-muted flex items-center gap-1.5">
              Financial Literacy
              <span className="font-mono font-bold text-[var(--color-gold-light)]">84%</span>
              <span className="text-xs text-[var(--color-emerald-light)] font-semibold">↑ 4%</span>
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 w-full relative">
        
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--color-emerald-light)] via-[var(--color-gold)] to-transparent opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute top-96 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-[var(--color-sapphire)] to-transparent opacity-10 blur-3xl pointer-events-none" />

        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] flex items-center gap-2">
              Continue Learning
            </h2>
            <span className="text-xs text-[var(--color-gold-light)] font-mono font-semibold">
              Current Module
            </span>
          </div>

          <div className="relative rounded-2xl overflow-hidden min-h-[280px] md:min-h-[300px] flex items-center p-6 md:p-10 border border-border group transition-all duration-300 hover:border-gold-light/30 shadow-2xl">
            <img
              src={featuredCourse.image || architectureWealthImg}
              alt={featuredCourse.title}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/85 to-transparent" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[var(--color-gold-light)] text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                    {featuredCourse.moduleNumber || "Module 1"}
                  </span>
                  <span className="bg-white/10 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                    {featuredCourse.duration}
                  </span>
                </div>

                <h3 className="font-display text-2xl md:text-4xl mb-3 text-white">
                  {featuredCourse.title}
                </h3>
                <p className="text-[var(--color-gold-light)]/70 text-xs md:text-sm max-w-lg leading-relaxed mb-4">
                  {featuredCourse.description}
                </p>

                <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
                  <span>{featuredCourse.lessons.filter((l) => l.completed).length} / {featuredCourse.totalLessons} Lessons Done</span>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-stretch lg:items-end gap-5">
                <div className="w-full lg:max-w-[220px]">
                  <div className="flex justify-between text-xs text-text-muted mb-2 font-mono">
                    <span>Course Progress</span>
                    <span className="text-white font-semibold">{featuredCourse.progress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--color-gold)] to-[var(--color-gold-light)] rounded-full transition-all duration-500"
                      style={{ width: `${featuredCourse.progress}%` }}
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCourse(featuredCourse)}
                  className="bg-[var(--color-gold-light)] text-obsidian font-bold text-xs md:text-sm py-3 px-6 rounded-xl hover:bg-white hover:shadow-lg hover:shadow-gold-light/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 shadow-md"
                >
                  <span>Resume Lesson</span>
                  <span className="text-base">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── TAB SWITCHER ── */}
        <div className="flex gap-1 bg-card border border-border/80 rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setPageTab("courses")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pageTab === "courses"
                ? "bg-[var(--color-gold-light)] text-obsidian shadow-sm"
                : "text-text-muted hover:text-white"
            }`}
          >
            Courses
          </button>
          <button
            onClick={() => setPageTab("progress")}
            className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              pageTab === "progress"
                ? "bg-[var(--color-gold-light)] text-obsidian shadow-sm"
                : "text-text-muted hover:text-white"
            }`}
          >
            My Progress
          </button>
        </div>

        {/* ── COURSES TAB ── */}
        {pageTab === "courses" && (
        <div className="mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-1">
                Course Catalogue
              </h2>
              <p className="text-xs text-text-muted">
                Explore structured modules across core financial disciplines
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-card p-1.5 rounded-xl border border-border/80 w-full md:w-auto">
              {["All", "Fundamentals", "Investing", "Safety & Scams", "Tax & Strategy"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-[var(--color-gold-light)] text-obsidian font-semibold shadow-sm"
                      : "text-text-muted hover:text-white hover:bg-obsidian/50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search courses by topic, skill, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-card border border-border/80 rounded-xl py-3 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-[var(--color-gold-light)]/60 transition-colors"
            />
            <span className="absolute left-3.5 top-3.5 text-text-muted text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-xs text-text-muted hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCourses.map((course) => {
              if (course.isSecurityLayer) {
                return (
                  <div
                    key={course.id}
                    onClick={() => navigate("/scams")}
                    className="bg-card border border-amber-500/30 hover:border-amber-500/60 rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer md:col-span-2 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                    <div className="w-16 h-16 rounded-xl bg-amber-950/40 border border-amber-900/50 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                          Security Layer
                        </span>
                        <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                          Essential Protection
                        </span>
                      </div>
                      <h4 className="font-display text-xl text-text-primary mb-1">
                        {course.title}
                      </h4>
                        <p className="text-xs text-[var(--color-gold-light)]/70 leading-relaxed">
                        {course.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-obsidian transition-all inline-flex items-center gap-1.5 shadow-sm">
                        <span>Launch Alerts</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={course.id}
                  onClick={() => !course.isLocked && handleOpenCourse(course)}
                  className={`bg-card border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 group ${
                    course.isLocked
                      ? "border-border/20 cursor-default grayscale opacity-50 saturate-0"
                      : "border-border/80 hover:border-gold-light/30 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    {course.image ? (
                      <img
                        src={course.image}
                        alt={course.title}
                        className="w-16 h-16 rounded-xl object-cover border border-border/50 group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-obsidian border border-border/50 flex items-center justify-center">
                        <svg className="w-6 h-6 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold text-[var(--color-gold-light)] uppercase tracking-wider">
                          {course.category}
                        </span>
                        {course.isLocked && (
                          <span className="text-[10px] bg-border/40 text-text-muted/60 px-2 py-0.5 rounded">
                            Coming Soon
                          </span>
                        )}
                      </div>
                      <h4 className="font-display text-lg text-text-primary truncate mb-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-text-muted flex items-center gap-2">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.totalLessons} Lessons</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs text-text-muted font-mono">
                      {course.isLocked ? "Prerequisite required" : `${course.progress}% Completed`}
                    </span>

                    {!course.isLocked && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-border rounded-full overflow-hidden w-20">
                          <div
                            className={`h-full rounded-full ${
                              course.progress === 100
                                ? "bg-[var(--color-gold)]"
                                : "bg-[var(--color-emerald-light)]"
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-gold-light)] group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCourses.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-8 text-center text-text-muted">
              <span className="text-3xl block mb-3">
                <svg className="w-8 h-8 mx-auto text-text-muted/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </span>
              <p className="text-sm font-semibold text-text-primary mb-1">No courses found</p>
              <p className="text-xs">Try adjusting your category filter or search terms.</p>
            </div>
          )}
        </div>
        )}

        {pageTab === "progress" && (
          <div>
            {/* Skill Mastery */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-text-muted)]">
                  Skill Mastery Matrix
                </h2>
                <span className="text-xs text-text-muted font-mono">
                  Click skill to filter courses
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {SKILL_ITEMS.map((skill) => (
                  <SkillCircle
                    key={skill.id}
                    percent={skill.percent}
                    label={skill.label}
                    status={skill.status}
                    isLocked={skill.isLocked}
                    isSelected={selectedCategory === skill.label}
                    onClick={() => {
                      if (skill.isLocked) return;
                      setSelectedCategory(selectedCategory === skill.label ? "All" : skill.label);
                      setPageTab("courses");
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
              {courses
                .filter((c) => !c.isLocked && !c.isSecurityLayer && c.lessons.length > 0)
                .map((course) => (
                  <div
                    key={course.id}
                    className="bg-card border border-border/80 rounded-2xl p-5 cursor-pointer hover:border-gold-light/30 transition-all group"
                    onClick={() => handleOpenCourse(course)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {course.image && (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="w-10 h-10 rounded-lg object-cover border border-border/50"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold-light)]">
                          {course.category}
                        </p>
                        <p className="text-sm font-semibold text-text-primary truncate">
                          {course.title}
                        </p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-text-muted">
                          {course.lessons.filter((l) => l.completed).length} / {course.totalLessons} lessons
                        </span>
                        <span
                          className={`font-semibold ${
                            course.progress === 100
                              ? "text-[var(--color-gold-light)]"
                              : "text-[var(--color-emerald-light)]"
                          }`}
                        >
                          {course.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            course.progress === 100
                              ? "bg-[var(--color-gold)]"
                              : "bg-[var(--color-emerald-light)]"
                          }`}
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-[10px] text-text-muted group-hover:text-gold-light transition-colors">
                      {course.progress === 100
                        ? "Completed — click to review"
                        : course.progress === 0
                        ? "Not started yet"
                        : "In progress — click to continue"}
                    </p>
                  </div>
                ))}
            </div>

          </div>
        )}
      </main>

      {activeCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border/80 flex items-start justify-between bg-obsidian/40">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold-light)] block mb-1">
                  {activeCourseModal.category}
                </span>
                <h3 className="font-display text-2xl text-white mb-1">
                  {activeCourseModal.title}
                </h3>
                <p className="text-xs text-text-muted flex items-center gap-3">
                  <span>{activeCourseModal.duration}</span>
                  <span>•</span>
                  <span>{activeCourseModal.lessons.length} Lessons</span>
                  <span>•</span>
                  <span className="text-[var(--color-gold-light)] font-mono font-bold">
                    {activeCourseModal.progress}% Completed
                  </span>
                </p>
              </div>

              <button
                onClick={() => setActiveCourseModal(null)}
                className="text-text-muted hover:text-white p-2 rounded-lg bg-obsidian border border-border text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>

            
            <div className="flex border-b border-border/80 px-6 bg-obsidian/20">
              <button
                onClick={() => setModalTab("outline")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                  modalTab === "outline"
                    ? "border-[var(--color-gold-light)] text-[var(--color-gold-light)]"
                    : "border-transparent text-text-muted hover:text-white"
                }`}
              >
                Course Syllabus ({activeCourseModal.lessons.length})
              </button>
              {activeCourseModal.quiz && (
                <button
                  onClick={() => setModalTab("quiz")}
                  className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                    modalTab === "quiz"
                      ? "border-[var(--color-gold-light)] text-[var(--color-gold-light)]"
                      : "border-transparent text-text-muted hover:text-white"
                  }`}
                >
                  Knowledge Check Quiz
                </button>
              )}
            </div>

  
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {modalTab === "outline" ? (
                <div className="space-y-3">
                  {activeCourseModal.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className={`p-4 rounded-xl border transition-all ${
                        lesson.completed
                          ? "bg-emerald-950/10 border-emerald-900/30"
                          : "bg-obsidian/60 border-border/60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              handleToggleLesson(activeCourseModal.id, lesson.id)
                            }
                            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                              lesson.completed
                                ? "bg-emerald-500 border-emerald-400 text-obsidian font-bold"
                                : "border-border text-transparent hover:border-gold-light"
                            }`}
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <h4
                            className={`text-sm font-semibold ${
                              lesson.completed
                                ? "text-white line-through opacity-80"
                                : "text-text-primary"
                            }`}
                          >
                            {lesson.id}. {lesson.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-text-muted">
                          {lesson.duration}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted pl-9 leading-relaxed">
                        {lesson.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                activeCourseModal.quiz && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-white">
                      {activeCourseModal.quiz.question}
                    </p>
                    <div className="space-y-2">
                      {activeCourseModal.quiz.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            if (quizAnswered) return;
                            setSelectedQuizOption(idx);
                          }}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                            selectedQuizOption === idx
                              ? idx === activeCourseModal.quiz?.correctAnswer
                                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                                : "bg-red-950/50 border-red-500 text-red-300"
                              : "bg-obsidian border-border text-text-muted hover:border-text-muted"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>

                    {selectedQuizOption !== null && !quizAnswered && (
                      <button
                        onClick={() => setQuizAnswered(true)}
                        className="px-4 py-2 rounded-lg bg-[var(--color-gold-light)] text-obsidian font-bold text-xs"
                      >
                        Confirm Answer
                      </button>
                    )}

                    {quizAnswered && (
                      <div className="p-4 rounded-xl bg-obsidian border border-border text-xs leading-relaxed">
                        <p className="font-semibold mb-1 text-white">Explanation:</p>
                        <p className="text-text-muted">
                          {activeCourseModal.quiz.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div className="p-4 border-t border-border/80 bg-obsidian/40 flex justify-end">
              <button
                onClick={() => setActiveCourseModal(null)}
                className="px-5 py-2 rounded-xl bg-[var(--color-gold-light)] text-obsidian font-bold text-xs hover:bg-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
