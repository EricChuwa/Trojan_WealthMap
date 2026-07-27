const { analyzeInvestment, askFollowUp } = require("../services/claudeService");

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

async function followUp(req, res) {
  try {
    const { originalText, riskLevel, summary, question } = req.body;
    if (!originalText || !riskLevel || !summary || !question) {
      return res.status(400).json({
        success: false,
        message: "originalText, riskLevel, summary, and question are all required.",
      });
    }
    const answer = await askFollowUp(originalText, riskLevel, summary, question);
    return res.status(200).json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("Follow-up Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
}

module.exports = {
  analyzeSmellTest,
  followUp,
};