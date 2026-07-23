import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getDashboard } from "../api/flow";
import {
  fetchCourses,
  fetchCourseDetail,
  updateLessonProgress,
  submitQuizAttempt,
  fetchSkills,
  type CourseSummary,
  type CourseDetail,
  type ResumeTarget,
  type Skill,
} from "../api/learn";

import architectureWealthImg from "../assets/architecture_of_wealth.png";
import psychologyMoneyImg from "../assets/psychology_of_money.png";
import strategicSavingImg from "../assets/strategic_saving.png";
import indexFundsImg from "../assets/index_funds.png";

// The backend stores image_url per course (null for our seeded content) —
// map by title to keep the existing art direction without image hosting yet.
const COURSE_IMAGES: Record<string, string> = {
  "The Architecture of Wealth": architectureWealthImg,
  "The Psychology of Money": psychologyMoneyImg,
  "Strategic Saving": strategicSavingImg,
  "Index Funds & ETFs": indexFundsImg,
};

function formatDuration(minutes: number | null): string {
  if (!minutes) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} mins`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

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

const SCAM_CARD = {
  title: "Staying Safe & Spotting Scams",
  description:
    "Learn to recognize real scam tactics, mobile money fraud, and red flags.",
};

export default function Learn() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [resume, setResume] = useState<ResumeTarget | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [streakDays, setStreakDays] = useState<number | null>(null);
  const [literacyScore, setLiteracyScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pageTab, setPageTab] = useState<"courses" | "progress">("courses");

  const [activeCourseModal, setActiveCourseModal] = useState<CourseDetail | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalTab, setModalTab] = useState<"outline" | "quiz">("outline");
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{
    isCorrect: boolean;
    explanation: string | null;
  } | null>(null);

  function refreshAll() {
    return Promise.all([fetchCourses(), fetchSkills(), getDashboard()])
      .then(([coursesRes, skillsRes, dashboard]) => {
        setCourses(coursesRes.courses);
        setResume(coursesRes.resume);
        setSkills(skillsRes);
        setStreakDays(dashboard.health?.streak_days ?? null);
        setLiteracyScore(dashboard.health?.literacy_score ?? null);
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    refreshAll();
  }, []);

  function retryLoad() {
    setLoading(true);
    setLoadError(null);
    refreshAll();
  }

  const featuredCourse =
    (resume && courses.find((c) => c.id === resume.courseId)) || courses[0];

  const filteredCourses = courses.filter((course) => {
    const matchesSkill = !activeSkillFilter || course.skills.includes(activeSkillFilter);

    const matchesCategory =
      selectedCategory === "All" ||
      (selectedCategory === "In Progress" && course.progress > 0 && course.progress < 100) ||
      (selectedCategory === "Mastered" && course.progress === 100) ||
      course.category === selectedCategory;

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      course.title.toLowerCase().includes(q) ||
      course.description.toLowerCase().includes(q);

    return matchesSkill && matchesCategory && matchesSearch;
  });

  const scamCardMatches =
    !activeSkillFilter &&
    (selectedCategory === "All" || selectedCategory === "Safety & Scams") &&
    (SCAM_CARD.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      SCAM_CARD.description.toLowerCase().includes(searchQuery.toLowerCase()));

  async function handleOpenCourse(course: CourseSummary) {
    if (course.isLocked) return;
    setModalTab("outline");
    setQuizIndex(0);
    setSelectedQuizOption(null);
    setQuizResult(null);
    setModalLoading(true);
    setActiveCourseModal(null);
    try {
      const detail = await fetchCourseDetail(course.id);
      setActiveCourseModal(detail);
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setModalLoading(false);
    }
  }

  async function handleToggleLesson(lessonId: string) {
    if (!activeCourseModal) return;
    const lesson = activeCourseModal.lessons.find((l) => l.id === lessonId);
    if (!lesson) return;

    const nowCompleted = lesson.status !== "completed";
    const newStatus: "completed" | "not_started" = nowCompleted ? "completed" : "not_started";
    const newPercent = nowCompleted ? 100 : 0;

    try {
      await updateLessonProgress(lessonId, {
        status: newStatus,
        progressPercent: newPercent,
      });

      const updatedLessons = activeCourseModal.lessons.map((l) =>
        l.id === lessonId ? { ...l, status: newStatus, progressPercent: newPercent } : l,
      );
      const completedCount = updatedLessons.filter((l) => l.status === "completed").length;
      const newProgress =
        updatedLessons.length > 0
          ? Math.round((completedCount / updatedLessons.length) * 100)
          : 0;

      // Instant feedback in the open modal.
      setActiveCourseModal({ ...activeCourseModal, lessons: updatedLessons, progress: newProgress });

      // A single lesson's completion can ripple beyond this one course: skill
      // mastery aggregates across every course tagged to that skill, and
      // other courses may unlock once this one crosses 100%. Only a fresh
      // fetch reflects that correctly — a local patch of just this course
      // can't.
      const [coursesRes, skillsRes] = await Promise.all([fetchCourses(), fetchSkills()]);
      setCourses(coursesRes.courses);
      setResume(coursesRes.resume);
      setSkills(skillsRes);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  async function handleSubmitQuizAnswer() {
    if (!activeCourseModal || selectedQuizOption === null) return;
    const question = activeCourseModal.quiz[quizIndex];
    try {
      const result = await submitQuizAttempt(question.id, selectedQuizOption);
      setQuizResult(result);
    } catch (err) {
      setActionError((err as Error).message);
    }
  }

  function handleNextQuestion() {
    setQuizIndex((i) => i + 1);
    setSelectedQuizOption(null);
    setQuizResult(null);
  }

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
              <span className="font-semibold text-text-primary">
                {streakDays !== null ? `${streakDays} Day Streak` : "No streak yet"}
              </span>
            </span>
            <span className="text-text-muted/30">|</span>
            <span className="text-sm text-text-muted flex items-center gap-1.5">
              Financial Literacy
              <span className="font-mono font-bold text-[var(--color-gold-light)]">
                {literacyScore !== null ? `${literacyScore}%` : "—"}
              </span>
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-10 w-full relative">
        <div className="absolute top-10 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[var(--color-emerald-light)] via-[var(--color-gold)] to-transparent opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute top-96 left-0 w-80 h-80 rounded-full bg-gradient-to-tr from-[var(--color-sapphire)] to-transparent opacity-10 blur-3xl pointer-events-none" />

        {loading ? (
          <p className="text-center py-24 text-text-muted">Loading your courses...</p>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <p className="text-text-muted">Couldn't load the Learn page — {loadError}</p>
            <button
              onClick={retryLoad}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-gold-light)] text-obsidian"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {actionError && (
              <div className="mb-6 rounded-xl px-4 py-3 text-sm bg-red-950/30 border border-red-900/40 text-red-300">
                {actionError}
              </div>
            )}

            {featuredCourse && (
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
                    src={COURSE_IMAGES[featuredCourse.title] || architectureWealthImg}
                    alt={featuredCourse.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/85 to-transparent" />

                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center">
                    <div className="lg:col-span-8">
                      <div className="flex items-center gap-2 mb-3">
                        {featuredCourse.moduleNumber && (
                          <span className="bg-[var(--color-gold-light)] text-obsidian text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
                            {featuredCourse.moduleNumber}
                          </span>
                        )}
                        <span className="bg-white/10 text-white text-[10px] font-semibold px-2.5 py-1 rounded-md">
                          {formatDuration(featuredCourse.durationMinutes)}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl md:text-4xl mb-3 text-white">
                        {featuredCourse.title}
                      </h3>
                      <p className="text-[var(--color-gold-light)]/70 text-xs md:text-sm max-w-lg leading-relaxed mb-4">
                        {featuredCourse.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
                        <span>
                          {featuredCourse.completedLessons} / {featuredCourse.totalLessons} Lessons Done
                        </span>
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
            )}

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
                        onClick={() => {
                          setSelectedCategory(cat);
                          setActiveSkillFilter(null);
                        }}
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
                  {scamCardMatches && (
                    <div
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
                          {SCAM_CARD.title}
                        </h4>
                        <p className="text-xs text-[var(--color-gold-light)]/70 leading-relaxed">
                          {SCAM_CARD.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 group-hover:bg-amber-500 group-hover:text-obsidian transition-all inline-flex items-center gap-1.5 shadow-sm">
                          <span>Launch Alerts</span>
                          <span>→</span>
                        </span>
                      </div>
                    </div>
                  )}

                  {filteredCourses.map((course) => (
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
                        {COURSE_IMAGES[course.title] ? (
                          <img
                            src={COURSE_IMAGES[course.title]}
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
                                Prerequisite required
                              </span>
                            )}
                          </div>
                          <h4 className="font-display text-lg text-text-primary truncate mb-1">
                            {course.title}
                          </h4>
                          <p className="text-xs text-text-muted flex items-center gap-2">
                            <span>{formatDuration(course.durationMinutes)}</span>
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
                  ))}
                </div>

                {filteredCourses.length === 0 && !scamCardMatches && (
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
                    {skills.map((skill) => {
                      const status = skill.isLocked
                        ? "Locked"
                        : skill.percent === 100
                        ? "Mastered"
                        : skill.percent > 0
                        ? "In Progress"
                        : "Started";
                      return (
                        <SkillCircle
                          key={skill.id}
                          percent={skill.percent}
                          label={skill.name}
                          status={status}
                          isLocked={skill.isLocked}
                          isSelected={activeSkillFilter === skill.name}
                          onClick={() => {
                            if (skill.isLocked) return;
                            setActiveSkillFilter(activeSkillFilter === skill.name ? null : skill.name);
                            setSelectedCategory("All");
                            setPageTab("courses");
                          }}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {courses
                    .filter((c) => !c.isLocked && c.totalLessons > 0)
                    .map((course) => (
                      <div
                        key={course.id}
                        className="bg-card border border-border/80 rounded-2xl p-5 cursor-pointer hover:border-gold-light/30 transition-all group"
                        onClick={() => handleOpenCourse(course)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {COURSE_IMAGES[course.title] && (
                            <img
                              src={COURSE_IMAGES[course.title]}
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
                              {course.completedLessons} / {course.totalLessons} lessons
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
          </>
        )}
      </main>

      {(modalLoading || activeCourseModal) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border/80 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {modalLoading || !activeCourseModal ? (
              <div className="p-10 text-center text-text-muted">Loading course...</div>
            ) : (
              <>
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
                      <span>{formatDuration(activeCourseModal.durationMinutes)}</span>
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
                  {activeCourseModal.quiz.length > 0 && (
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
                      {activeCourseModal.lessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className={`p-4 rounded-xl border transition-all ${
                            lesson.status === "completed"
                              ? "bg-emerald-950/10 border-emerald-900/30"
                              : "bg-obsidian/60 border-border/60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleToggleLesson(lesson.id)}
                                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs cursor-pointer transition-colors ${
                                  lesson.status === "completed"
                                    ? "bg-emerald-500 border-emerald-400 text-obsidian font-bold"
                                    : "border-border text-transparent hover:border-gold-light"
                                }`}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                              </button>
                              <h4
                                className={`text-sm font-semibold ${
                                  lesson.status === "completed"
                                    ? "text-white line-through opacity-80"
                                    : "text-text-primary"
                                }`}
                              >
                                {idx + 1}. {lesson.title}
                              </h4>
                            </div>
                            <span className="text-[10px] font-mono text-text-muted">
                              {formatDuration(lesson.durationMinutes)}
                            </span>
                          </div>
                          <p className="text-xs text-text-muted pl-9 leading-relaxed">
                            {lesson.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    activeCourseModal.quiz[quizIndex] && (
                      <div className="space-y-4">
                        {activeCourseModal.quiz.length > 1 && (
                          <p className="text-[10px] uppercase tracking-widest text-text-muted">
                            Question {quizIndex + 1} of {activeCourseModal.quiz.length}
                          </p>
                        )}
                        <p className="text-sm font-semibold text-white">
                          {activeCourseModal.quiz[quizIndex].question}
                        </p>
                        <div className="space-y-2">
                          {activeCourseModal.quiz[quizIndex].options.map((opt) => {
                            const isSelected = selectedQuizOption === opt.id;
                            let style =
                              "bg-obsidian border-border text-text-muted hover:border-text-muted";
                            if (isSelected && quizResult) {
                              style = quizResult.isCorrect
                                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-semibold"
                                : "bg-red-950/50 border-red-500 text-red-300";
                            } else if (isSelected) {
                              style = "bg-obsidian border-gold-light text-white";
                            }
                            return (
                              <button
                                key={opt.id}
                                onClick={() => {
                                  if (quizResult) return;
                                  setSelectedQuizOption(opt.id);
                                }}
                                className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${style}`}
                              >
                                {opt.text}
                              </button>
                            );
                          })}
                        </div>

                        {selectedQuizOption !== null && !quizResult && (
                          <button
                            onClick={handleSubmitQuizAnswer}
                            className="px-4 py-2 rounded-lg bg-[var(--color-gold-light)] text-obsidian font-bold text-xs"
                          >
                            Confirm Answer
                          </button>
                        )}

                        {quizResult && (
                          <>
                            <div className="p-4 rounded-xl bg-obsidian border border-border text-xs leading-relaxed">
                              <p className="font-semibold mb-1 text-white">
                                {quizResult.isCorrect ? "Correct!" : "Not quite."} Explanation:
                              </p>
                              <p className="text-text-muted">{quizResult.explanation}</p>
                            </div>
                            {quizIndex + 1 < activeCourseModal.quiz.length && (
                              <button
                                onClick={handleNextQuestion}
                                className="px-4 py-2 rounded-lg bg-[var(--color-gold-light)] text-obsidian font-bold text-xs"
                              >
                                Next Question →
                              </button>
                            )}
                          </>
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
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
