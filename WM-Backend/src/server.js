require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Trojan WealthMap Backend is running",
    });
});

app.get("/api/profile", authenticateToken, (req, res) => {
    res.json({
        success: true,
        message: "Protected route accessed.",
        user: req.user,
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});