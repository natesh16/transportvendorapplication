const request = require("supertest");
const app = require("../app");

describe("SUPER ADMIN AUTH API", () => {

  it("should reject login without credentials", async () => {
    const res = await request(app)
      .post("/api/super-admin/login/superadmin")
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/required/i);
  });

  it("should login with valid credentials", async () => {
    await request(app)
      .post("/api/super-admin/create/superadmin")
      .send({
        name: "System Admin",
        email: "super@test.com",
        password: "Admin@123",
        confirmPassword: "Admin@123"
      });

    const res = await request(app)
      .post("/api/super-admin/login/superadmin")
      .send({
        email: "super@test.com",
        password: "Admin@123"
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

});
