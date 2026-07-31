const request = require("supertest");
const app = require("../app");

describe("GET /api/investments", () => {
  test("responds with 200 and a list of investment options", async () => {
    const res = await request(app).get("/api/investments");
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.options)).toBe(true);
  }, 40000);

  test("each option has the expected fields", async () => {
    const res = await request(app).get("/api/investments");
    const first = res.body.options[0];
    expect(first).toHaveProperty("option_id");
    expect(first).toHaveProperty("name");
    expect(first).toHaveProperty("risk_level");
    expect(first).toHaveProperty("min_amount");
    expect(first).toHaveProperty("expected_return");
  }, 40000);

  test("options are not limited to a fixed small number", async () => {
    const res = await request(app).get("/api/investments");
    expect(res.body.options.length).toBeGreaterThanOrEqual(4);
  }, 40000);
});

const pool = require("../config/db");

afterAll(async () => {
  await pool.end();
});