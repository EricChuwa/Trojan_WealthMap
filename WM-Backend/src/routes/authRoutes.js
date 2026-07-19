const express = require("express");
const rateLimit = require("express-rate-limit");
const { register, login } = require("../controllers/authController");

const router = express.Router();

// Limit repeated login/register attempts from one IP to slow brute-forcing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a few minutes.",
  },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);

module.exports = router;