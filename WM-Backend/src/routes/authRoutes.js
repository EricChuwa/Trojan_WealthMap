const express = require("express");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");
const { register } = require("../controllers/authController");
const users = require("../data/users");

const router = express.Router();

// Register a new user
router.post("/register", register);

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    // Compare password with stored hash
    const validPassword = await bcrypt.compare(
        password,
        user.passwordHash
    );

    if (!validPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

    // Generate JWT
    const token = generateToken({
        id: user.id,
        email: user.email
    });

    res.status(200).json({
        success: true,
        message: "Login successful",
        token
    });
});

module.exports = router;