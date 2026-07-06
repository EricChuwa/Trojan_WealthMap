const express = require("express");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/jwt");

const router = express.Router();

/*
 * Demo login route.
 * Replace the hard-coded credentials with database validation later.
 */
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    const demoUser = {
        id: 1,
        email: "admin@trojan.com",
        passwordHash: await bcrypt.hash("password123", 10),
    };

    if (email !== demoUser.email) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
    }

    const validPassword = await bcrypt.compare(
        password,
        demoUser.passwordHash
    );

    if (!validPassword) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials",
        });
    }

    const token = generateToken({
        id: demoUser.id,
        email: demoUser.email,
    });

    res.json({
        success: true,
        token,
    });
});

module.exports = router;