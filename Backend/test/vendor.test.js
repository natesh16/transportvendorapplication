const request = require("supertest");
const app = require("../app");

let token;

beforeAll(async () => {
  await request(app)
    .post("/api/auth/register")
    .send({
      email: "admin@corp.com",
      password: "Test@123",
      role: "CORPORATE_ADMIN"
    });

  const login = await request(app)
    .post("/api/auth/login")
    .send({
      email: "admin@corp.com",
      password: "Test@123"
    });

  token = login.body.token;
});

describe("TRANSPORT VENDOR API", () => {
  it("should block unauthenticated vendor creation", async () => {
    const res = await request(app)
      .post("/api/vendors")
      .send({ vendorName: "ABC Transport" });

    expect(res.statusCode).toBe(401);
  });

  it("should create vendor with valid token", async () => {
    const res = await request(app)
      .post("/api/vendors")
      .set("Authorization", `Bearer ${token}`)
      .send({
        vendorName: "ABC Transport",
        vendorType: "PRIVATE_LIMITED"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("vendorCode");
  });

  it("should fetch vendor list", async () => {
    const res = await request(app)
      .get("/api/vendors")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
