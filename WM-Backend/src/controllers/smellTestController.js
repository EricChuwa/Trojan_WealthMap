const { analyzeInvestment } = require("../services/claudeService");

async function analyzeSmellTest(req, res) {
  try {
    const { text } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "A non-empty text field is required.",
      });
    }

    const result = await analyzeInvestment(text.trim());

    return res.status(200).json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error("Smell Test Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  analyzeSmellTest,
};