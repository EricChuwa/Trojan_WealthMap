const { isValidEmail, isValidPassword } = require("../validators");

describe("isValidEmail", () => {
  test("accepts a valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  test("rejects a string with no @ symbol", () => {
    expect(isValidEmail("notanemail")).toBe(false);
  });

  test("rejects a string with no domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  test("rejects a non-string input", () => {
    expect(isValidEmail(12345)).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidPassword", () => {
  test("accepts a password of exactly 8 characters", () => {
    expect(isValidPassword("abcdefgh")).toBe(true);
  });

  test("accepts a password longer than 8 characters", () => {
    expect(isValidPassword("aVeryLongPassword123")).toBe(true);
  });

  test("rejects a password shorter than 8 characters", () => {
    expect(isValidPassword("short")).toBe(false);
  });

  test("rejects a non-string input", () => {
    expect(isValidPassword(12345678)).toBe(false);
  });

  test("rejects an empty string", () => {
    expect(isValidPassword("")).toBe(false);
  });
});