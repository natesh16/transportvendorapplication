const request = require("supertest");
const app = require("../app");

let token;

beforeAll(async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: "sup@corp.com",
      password: "Test@123",
      role: "CORPORATE_SUPERVISOR"
    });

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "sup@corp.com",
      password: "Test@123"
    });

  token = login.body.token;
});

describe("EMPLOYEE API", () => {
  it("should create employee", async () => {
    const res = await request(app)
      .post("/api/employees")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: { firstName: "John", lastName: "Doe" },
        phone: "9876543210",
        email: "john@test.com"
      });

    expect(res.statusCode).toBe(201);
  });
});
