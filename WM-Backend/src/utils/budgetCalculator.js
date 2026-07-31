// Applies the 50/30/20 budgeting rule to a monthly income figure.
// Extracted from budgetController so the calculation itself is unit-testable
// without needing a database connection or an HTTP request.
function calculateBudgetSplit(income) {
  const needs = Math.round(income * 0.5 * 100) / 100;
  const wants = Math.round(income * 0.3 * 100) / 100;
  const savings = Math.round(income * 0.2 * 100) / 100;
  return { needs, wants, savings };
}

module.exports = { calculateBudgetSplit };