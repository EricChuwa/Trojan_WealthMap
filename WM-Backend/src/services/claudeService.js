const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function analyzeInvestment(text) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 500,
      temperature: 0.2,

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

module.exports = {
  analyzeInvestment,
};