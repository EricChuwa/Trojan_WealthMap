const express = require("express");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");
const { register } = require("../controllers/authController");
const users = require("../data/users");

const router = express.Router();

router.post("/register", register);

router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const user = users.find(user => user.email === email);

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        });
    }

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