import { authFetch } from "./auth";

export interface CourseSummary {
  id: string;
  title: string;
  category: string;
  description: string;
  image?: string;
  durationMinutes: number | null;
  moduleNumber: string | null;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  isLocked: boolean;
  skills: string[];
}

export interface ResumeTarget {
  courseId: string;
  lessonId: string | null;
  progressPercent: number;
}

export interface LessonDetail {
  id: string;
  title: string;
  content: string;
  durationMinutes: number | null;
  status: "not_started" | "in_progress" | "completed";
  progressPercent: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestionDetail {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface CourseDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number | null;
  moduleNumber: string | null;
  totalLessons: number;
  progress: number;
  lessons: LessonDetail[];
  quiz: QuizQuestionDetail[];
}

export interface Skill {
  id: string;
  name: string;
  percent: number;
  isLocked: boolean;
}

async function unwrap(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || fallbackMessage);
  }
  return res.json();
}

export async function fetchCourses(params?: {
  search?: string;
  sort?: string;
  category?: string;
}): Promise<{ courses: CourseSummary[]; resume: ResumeTarget | null }> {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.sort) query.set("sort", params.sort);
  if (params?.category) query.set("category", params.category);
  const qs = query.toString();

  const res = await authFetch(`/learn/courses${qs ? `?${qs}` : ""}`);
  const result = await unwrap(res, "Failed to load courses");

  return {
    courses: result.courses.map(
      (c: {
        course_id: string;
        title: string;
        category: string;
        description: string;
        image_url?: string;
        duration_minutes: number | null;
        module_number: string | null;
        total_lessons: number;
        completed_lessons: number;
        progress: number;
        is_locked: boolean;
        skills: string[];
      }) => ({
        id: c.course_id,
        title: c.title,
        category: c.category,
        description: c.description,
        image: c.image_url,
        durationMinutes: c.duration_minutes,
        moduleNumber: c.module_number,
        totalLessons: c.total_lessons,
        completedLessons: c.completed_lessons,
        progress: c.progress,
        isLocked: c.is_locked,
        skills: c.skills,
      }),
    ),
    resume: result.resume
      ? {
          courseId: result.resume.course_id,
          lessonId: result.resume.lesson_id,
          progressPercent: result.resume.progress_percent,
        }
      : null,
  };
}

export async function fetchCourseDetail(courseId: string): Promise<CourseDetail> {
  const res = await authFetch(`/learn/courses/${courseId}`);
  const result = await unwrap(res, "Failed to load course");

  return {
    id: result.course.course_id,
    title: result.course.title,
    category: result.course.category,
    description: result.course.description,
    durationMinutes: result.course.duration_minutes,
    moduleNumber: result.course.module_number,
    totalLessons: result.course.total_lessons,
    progress: result.course.progress,
    lessons: result.lessons.map(
      (l: {
        lesson_id: string;
        title: string;
        content: string;
        duration_minutes: number | null;
        status: "not_started" | "in_progress" | "completed";
        progress_percent: number;
      }) => ({
        id: l.lesson_id,
        title: l.title,
        content: l.content,
        durationMinutes: l.duration_minutes,
        status: l.status,
        progressPercent: l.progress_percent,
      }),
    ),
    quiz: result.quiz.map(
      (q: {
        question_id: string;
        question_text: string;
        options: { option_id: string; option_text: string }[];
      }) => ({
        id: q.question_id,
        question: q.question_text,
        options: q.options.map((o) => ({ id: o.option_id, text: o.option_text })),
      }),
    ),
  };
}

export async function updateLessonProgress(
  lessonId: string,
  data: { status: "not_started" | "in_progress" | "completed"; progressPercent: number },
): Promise<void> {
  const res = await authFetch(`/learn/lessons/${lessonId}/progress`, {
    method: "PATCH",
    body: JSON.stringify({ status: data.status, progress_percent: data.progressPercent }),
  });
  await unwrap(res, "Failed to update lesson progress");
}

export async function submitQuizAttempt(
  questionId: string,
  selectedOptionId: string,
): Promise<{ isCorrect: boolean; explanation: string | null }> {
  const res = await authFetch(`/learn/questions/${questionId}/attempts`, {
    method: "POST",
    body: JSON.stringify({ selected_option_id: selectedOptionId }),
  });
  const result = await unwrap(res, "Failed to submit answer");
  return { isCorrect: result.is_correct, explanation: result.explanation };
}

export async function fetchSkills(): Promise<Skill[]> {
  const res = await authFetch("/learn/skills");
  const result = await unwrap(res, "Failed to load skills");
  return result.skills.map((s: { skill_id: string; name: string; percent: number; is_locked: boolean }) => ({
    id: s.skill_id,
    name: s.name,
    percent: s.percent,
    isLocked: s.is_locked,
  }));
}
