const express = require("express");
const {
  getCourses,
  getCourseDetail,
  updateLessonProgress,
  submitQuizAttempt,
  getSkills,
} = require("../controllers/learnController");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

// every Learn route requires a valid token
router.use(authenticateToken);

router.get("/courses", getCourses);
router.get("/courses/:id", getCourseDetail);
router.patch("/lessons/:id/progress", updateLessonProgress);
router.post("/questions/:id/attempts", submitQuizAttempt);
router.get("/skills", getSkills);

module.exports = router;
