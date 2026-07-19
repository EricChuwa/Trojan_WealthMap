const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const { generateToken } = require("../utils/jwt");
const { isValidEmail, isValidPassword } = require("../utils/validators");

const register = async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    password,
    phone_number,
    country,
    date_of_birth,
  } = req.body;

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please fill in all required fields.",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid email address.",
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 8 characters long.",
    });
  }

  try {
    const existingUser = await pool.query(
      "SELECT users_id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (first_name, last_name, email, password_hash, phone_number, country, date_of_birth)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING users_id, first_name, last_name, email, country, date_of_birth, created_at`,
      [
        first_name,
        last_name,
        email,
        passwordHash,
        phone_number,
        country,
        date_of_birth,
      ],
    );

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide email and password.",
    });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken({ id: user.users_id, email: user.email });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  register,
  login,
};
