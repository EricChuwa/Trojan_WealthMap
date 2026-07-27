const pool = require("../config/db");

// Risk levels sort low -> high so the frontend can render cards
// in a consistent order regardless of how many options exist.
const riskOrder = `CASE risk_level
  WHEN 'low' THEN 1
  WHEN 'medium' THEN 2
  WHEN 'high' THEN 3
  ELSE 4
END`;

const getInvestmentOptions = async (req, res) => {
  const { country } = req.query;

  try {
    let query = `
      SELECT option_id, country, name, risk_level, min_amount, expected_return
      FROM investment_options
      WHERE is_active = TRUE
    `;
    const params = [];

    if (country) {
      params.push(country);
      query += ` AND country = $${params.length}`;
    }

    query += ` ORDER BY ${riskOrder}, expected_return ASC`;

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      options: result.rows,
    });
  } catch (err) {
    console.error("Get investment options error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

module.exports = {
  getInvestmentOptions,
};