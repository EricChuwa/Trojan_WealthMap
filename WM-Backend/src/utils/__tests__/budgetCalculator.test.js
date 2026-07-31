const { calculateBudgetSplit } = require("../budgetCalculator");

describe("calculateBudgetSplit", () => {
  test("splits 1000 income into 50/30/20", () => {
    expect(calculateBudgetSplit(1000)).toEqual({
      needs: 500,
      wants: 300,
      savings: 200,
    });
  });

  test("splits a non-round income and rounds to 2 decimals", () => {
    expect(calculateBudgetSplit(333)).toEqual({
      needs: 166.5,
      wants: 99.9,
      savings: 66.6,
    });
  });

  test("handles a small income correctly", () => {
    expect(calculateBudgetSplit(10)).toEqual({
      needs: 5,
      wants: 3,
      savings: 2,
    });
  });

  test("allocations sum back to the original income", () => {
    const { needs, wants, savings } = calculateBudgetSplit(1500);
    expect(needs + wants + savings).toBeCloseTo(1500, 2);
  });
});