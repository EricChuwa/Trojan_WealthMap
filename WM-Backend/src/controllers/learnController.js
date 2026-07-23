const pool = require("../config/db");

const SORT_OPTIONS = {
  title: (a, b) => a.title.localeCompare(b.title),
  duration: (a, b) => (a.duration_minutes || 0) - (b.duration_minutes || 0),
  progress: (a, b) => b.progress - a.progress,
};

// GET /api/learn/courses?search=&sort=&category=
// Returns the catalogue with each course's per-user progress, lock status,
// and a single "resume" pointer to whichever lesson was last left off.
const getCourses = async (req, res) => {
  const userId = req.user.id;
  const { search, sort, category } = req.query;

  try {
    const result = await pool.query(
      `SELECT c.course_id, c.title, c.category, c.description, c.image_url,
              c.duration_minutes, c.module_number, c.prerequisite_course_id,
              COUNT(l.lesson_id) AS total_lessons,
              COUNT(ulp.lesson_id) FILTER (WHERE ulp.status = 'completed') AS completed_lessons
         FROM courses c
         LEFT JOIN lessons l ON l.course_id = c.course_id
         LEFT JOIN user_lesson_progress ulp
                ON ulp.lesson_id = l.lesson_id AND ulp.user_id = $1
        WHERE c.is_active = TRUE
        GROUP BY c.course_id`,
      [userId],
    );

    // Skill tags per course, so the frontend can filter by skill membership
    // instead of (incorrectly) matching a skill name against category.
    const skillsResult = await pool.query(
      `SELECT cs.course_id, s.name
         FROM course_skills cs
         JOIN skills s ON s.skill_id = cs.skill_id`,
    );
    const skillsByCourse = new Map();
    for (const row of skillsResult.rows) {
      if (!skillsByCourse.has(row.course_id)) skillsByCourse.set(row.course_id, []);
      skillsByCourse.get(row.course_id).push(row.name);
    }

    // Keyed by course_id so the prerequisite lock check below can look up
    // another course's progress without a second round trip.
    const byId = new Map();
    for (const row of result.rows) {
      const total = Number(row.total_lessons);
      const completed = Number(row.completed_lessons);
      byId.set(row.course_id, {
        course_id: row.course_id,
        title: row.title,
        category: row.category,
        description: row.description,
        image_url: row.image_url,
        duration_minutes: row.duration_minutes,
        module_number: row.module_number,
        prerequisite_course_id: row.prerequisite_course_id,
        total_lessons: total,
        completed_lessons: completed,
        progress: total > 0 ? Math.round((completed / total) * 100) : 0,
        skills: skillsByCourse.get(row.course_id) || [],
      });
    }

    let courses = Array.from(byId.values()).map((c) => ({
      ...c,
      is_locked:
        !!c.prerequisite_course_id &&
        (byId.get(c.prerequisite_course_id)?.progress ?? 0) < 100,
    }));

    if (search) {
      const q = search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q),
      );
    }
    if (category) {
      courses = courses.filter((c) => c.category === category);
    }
    courses.sort(SORT_OPTIONS[sort] || SORT_OPTIONS.title);

    // Resume target: the most recently touched lesson that isn't finished.
    const resumeResult = await pool.query(
      `SELECT ulp.lesson_id, l.course_id, ulp.progress_percent
         FROM user_lesson_progress ulp
         JOIN lessons l ON l.lesson_id = ulp.lesson_id
        WHERE ulp.user_id = $1 AND ulp.status != 'completed'
          AND ulp.last_accessed_at IS NOT NULL
        ORDER BY ulp.last_accessed_at DESC
        LIMIT 1`,
      [userId],
    );

    let resume = resumeResult.rows[0]
      ? {
          course_id: resumeResult.rows[0].course_id,
          lesson_id: resumeResult.rows[0].lesson_id,
          progress_percent: resumeResult.rows[0].progress_percent,
        }
      : null;

    if (!resume) {
      // Nothing started yet — default to the first unlocked course with content.
      const first = courses.find((c) => !c.is_locked && c.total_lessons > 0);
      resume = first
        ? { course_id: first.course_id, lesson_id: null, progress_percent: 0 }
        : null;
    }

    res.status(200).json({
      success: true,
      courses: courses.map(({ prerequisite_course_id, ...c }) => c),
      resume,
    });
  } catch (err) {
    console.error("Get courses error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/learn/courses/:id
const getCourseDetail = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const courseResult = await pool.query(
      `SELECT course_id, title, category, description, image_url,
              duration_minutes, module_number, prerequisite_course_id
         FROM courses WHERE course_id = $1 AND is_active = TRUE`,
      [id],
    );
    const course = courseResult.rows[0];
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const lessonsResult = await pool.query(
      `SELECT l.lesson_id, l.title, l.content, l.duration_minutes,
              COALESCE(ulp.status, 'not_started') AS status,
              COALESCE(ulp.progress_percent, 0) AS progress_percent
         FROM lessons l
         LEFT JOIN user_lesson_progress ulp
                ON ulp.lesson_id = l.lesson_id AND ulp.user_id = $2
        WHERE l.course_id = $1
        ORDER BY l.sort_order`,
      [id, userId],
    );

    // Options omit is_correct here — only revealed via the attempt result,
    // not while the user is still choosing.
    const questionsResult = await pool.query(
      `SELECT qq.question_id, qq.question_text, qq.sort_order AS q_sort,
              qo.option_id, qo.option_text, qo.sort_order AS o_sort
         FROM quiz_questions qq
         LEFT JOIN quiz_options qo ON qo.question_id = qq.question_id
        WHERE qq.course_id = $1
        ORDER BY qq.sort_order, qo.sort_order`,
      [id],
    );

    const questionMap = new Map();
    for (const row of questionsResult.rows) {
      if (!questionMap.has(row.question_id)) {
        questionMap.set(row.question_id, {
          question_id: row.question_id,
          question_text: row.question_text,
          options: [],
        });
      }
      if (row.option_id) {
        questionMap.get(row.question_id).options.push({
          option_id: row.option_id,
          option_text: row.option_text,
        });
      }
    }

    const totalLessons = lessonsResult.rows.length;
    const completedLessons = lessonsResult.rows.filter(
      (l) => l.status === "completed",
    ).length;

    res.status(200).json({
      success: true,
      course: {
        ...course,
        total_lessons: totalLessons,
        progress:
          totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0,
      },
      lessons: lessonsResult.rows.map((l) => ({
        lesson_id: l.lesson_id,
        title: l.title,
        content: l.content,
        duration_minutes: l.duration_minutes,
        status: l.status,
        progress_percent: l.progress_percent,
      })),
      quiz: Array.from(questionMap.values()),
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    console.error("Get course detail error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

const STATUSES = ["not_started", "in_progress", "completed"];

// PATCH /api/learn/lessons/:id/progress   { status, progress_percent }
// Upserts the caller's current position in a lesson. Always bumps
// last_accessed_at, which is what "resume last lesson" reads from.
const updateLessonProgress = async (req, res) => {
  const { id } = req.params;
  const { status, progress_percent } = req.body;
  const userId = req.user.id;

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be one of: not_started, in_progress, completed.",
    });
  }
  const percent = Number(progress_percent);
  if (Number.isNaN(percent) || percent < 0 || percent > 100) {
    return res.status(400).json({
      success: false,
      message: "progress_percent must be between 0 and 100.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO user_lesson_progress
         (user_id, lesson_id, status, progress_percent, last_accessed_at, completed_at)
       VALUES ($1, $2, $3::VARCHAR(20), $4, NOW(), CASE WHEN $3::VARCHAR(20) = 'completed' THEN NOW() ELSE NULL END)
       ON CONFLICT (user_id, lesson_id) DO UPDATE
         SET status = EXCLUDED.status,
             progress_percent = EXCLUDED.progress_percent,
             last_accessed_at = NOW(),
             completed_at = CASE WHEN EXCLUDED.status = 'completed'
                                  THEN COALESCE(user_lesson_progress.completed_at, NOW())
                                  ELSE NULL END
       RETURNING status, progress_percent, last_accessed_at, completed_at`,
      [userId, id, status, percent],
    );

    res.status(200).json({ success: true, progress: result.rows[0] });
  } catch (err) {
    if (err.code === "23503" || err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Lesson not found." });
    }
    console.error("Update lesson progress error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// POST /api/learn/questions/:id/attempts   { selected_option_id }
const submitQuizAttempt = async (req, res) => {
  const { id } = req.params;
  const { selected_option_id } = req.body;
  const userId = req.user.id;

  if (!selected_option_id) {
    return res
      .status(400)
      .json({ success: false, message: "selected_option_id is required." });
  }

  try {
    // Correctness is looked up server-side — never trust a client-provided verdict.
    const optionResult = await pool.query(
      `SELECT is_correct FROM quiz_options WHERE option_id = $1 AND question_id = $2`,
      [selected_option_id, id],
    );
    if (optionResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Option not found for this question." });
    }
    const isCorrect = optionResult.rows[0].is_correct;

    await pool.query(
      `INSERT INTO user_quiz_attempts (user_id, question_id, selected_option_id, is_correct)
       VALUES ($1, $2, $3, $4)`,
      [userId, id, selected_option_id, isCorrect],
    );

    const explanationResult = await pool.query(
      `SELECT explanation FROM quiz_questions WHERE question_id = $1`,
      [id],
    );

    res.status(201).json({
      success: true,
      is_correct: isCorrect,
      explanation: explanationResult.rows[0]?.explanation || null,
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Question not found." });
    }
    console.error("Submit quiz attempt error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/learn/skills
const getSkills = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT s.skill_id, s.name,
              COUNT(l.lesson_id) AS total_lessons,
              COUNT(ulp.lesson_id) FILTER (WHERE ulp.status = 'completed') AS completed_lessons
         FROM skills s
         LEFT JOIN course_skills cs ON cs.skill_id = s.skill_id
         LEFT JOIN lessons l ON l.course_id = cs.course_id
         LEFT JOIN user_lesson_progress ulp
                ON ulp.lesson_id = l.lesson_id AND ulp.user_id = $1
        GROUP BY s.skill_id
        ORDER BY s.sort_order`,
      [userId],
    );

    const skills = result.rows.map((row) => {
      const total = Number(row.total_lessons);
      const completed = Number(row.completed_lessons);
      return {
        skill_id: row.skill_id,
        name: row.name,
        percent: total > 0 ? Math.round((completed / total) * 100) : 0,
        is_locked: total === 0, // no course tagged to this skill yet
      };
    });

    res.status(200).json({ success: true, skills });
  } catch (err) {
    console.error("Get skills error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  getCourses,
  getCourseDetail,
  updateLessonProgress,
  submitQuizAttempt,
  getSkills,
};
