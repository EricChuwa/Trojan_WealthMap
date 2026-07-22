require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const budgetRoutes = require("./routes/budgetRoutes");
const smellTestRoutes = require("./routes/smellTestRoutes");
const goalRoutes = require("./routes/goalRoutes");

const authRoutes = require("./routes/authRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/smell-test", smellTestRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/fraud", fraudRoutes);

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
