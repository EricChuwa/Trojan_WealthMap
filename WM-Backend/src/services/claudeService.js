const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeInvestment(text) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 500,

      system: `
You are WealthMap's AI Financial Fraud Analyst.

Your job is to evaluate investment opportunities, financial offers, business opportunities, crypto schemes, side hustles, MLMs, and loan offers.

Look for:
- Guaranteed returns
- Unrealistic profits
- Artificial urgency
- Requests for upfront payments
- Missing regulation
- Emotional manipulation
- Pressure tactics
- Lack of transparency
- Pyramid/Ponzi characteristics
- High-risk language

Return ONLY valid JSON.

Format exactly:

{
  "risk":"GREEN",
  "summary":"Short explanation.",
  "questions":[
      "Question 1",
      "Question 2",
      "Question 3"
  ]
}

Rules:
- Never return markdown.
- Never explain your reasoning outside JSON.
- Never include code fences.
- Risk must ONLY be GREEN, AMBER, or RED.
`,

      messages: [
        {
          role: "user",
          content: `Analyze this investment opportunity:

${text}`,
        },
      ],
    });

    const response = message.content[0].text.trim();

    try {
      return JSON.parse(response);
    } catch (err) {
      console.error("Claude returned invalid JSON:");
      console.error(response);

      throw new Error("Claude returned an invalid response.");
    }
  } catch (error) {
    console.error("Claude API Error:", error);

    throw new Error("Unable to analyze investment.");
  }
}

async function askFollowUp(originalText, riskLevel, summary, question) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 400,
      system: `You are WealthMap's AI Financial Fraud Analyst. You already analyzed an investment pitch and gave a risk verdict. Now answer a specific follow-up question about it, briefly and directly, in plain text (no JSON, no markdown).`,
      messages: [
        {
          role: "user",
          content: `Original pitch: "${originalText}"\n\nYour verdict: ${riskLevel} - ${summary}\n\nFollow-up question: ${question}`,
        },
      ],
    });
    return message.content[0].text.trim();
  } catch (error) {
    console.error("Claude Follow-up Error:", error);
    throw new Error("Unable to answer follow-up.");
  }
}

module.exports = {
  analyzeInvestment,
  askFollowUp,
};

