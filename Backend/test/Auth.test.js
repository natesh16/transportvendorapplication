const request = require("supertest");
const app = require("../app");

describe("AUTH API", () => {
  it("should reject login without credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login");

    expect(res.statusCode).toBe(400);
  });

  it("should login with valid credentials", async () => {
    const register = await request(app)
      .post("/api/auth/register")
      .send({
        email: "admin@test.com",
        password: "Test@123",
        role: "CORPORATE_ADMIN"
      });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "admin@test.com",
        password: "Test@123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });
});
