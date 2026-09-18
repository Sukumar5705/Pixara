/**
 * tests/auth.test.js
 * Authentication & Authorization tests.
 *
 * Tests login, register, token protection, and role-based access using
 * Supertest against the real Express app with a test MongoDB database.
 * B2 service is mocked so no cloud credentials are required.
 */
jest.mock("../services/b2Service", () => ({
  generateSignedUploadUrl: jest.fn().mockResolvedValue({
    uploadUrl: "https://b2.example.com/upload",
    storageKey: "photos/test-key.jpg",
  }),
  generateSignedReadUrl: jest.fn().mockResolvedValue("https://b2.example.com/read/photo.jpg"),
  uploadBuffer: jest.fn().mockResolvedValue({ storageKey: "photos/test-key.jpg" }),
  deleteFile: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const {
  app,
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createAdmin,
  createTeamMember,
} = require("./helpers");

beforeAll(() => connectTestDB());
afterAll(() => closeTestDB());
afterEach(() => clearTestDB());

// ── Registration ─────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("registers a new user and returns a token", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "New User",
      email: "newuser@example.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.role).toBe("team"); // public signup always creates team role
  });

  it("rejects duplicate email with 400", async () => {
    await createTeamMember({ email: "dup@example.com" });

    const res = await request(app).post("/api/auth/register").send({
      name: "Dup User",
      email: "dup@example.com",
      password: "password123",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid email format with 400", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "User",
      email: "not-an-email",
      password: "password123",
    });

    expect(res.status).toBe(400);
  });

  it("rejects password shorter than 6 chars", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "User",
      email: "short@example.com",
      password: "abc",
    });

    expect(res.status).toBe(400);
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("returns a token on valid credentials", async () => {
    await createTeamMember({ email: "login@example.com", password: "password123" });

    const res = await request(app).post("/api/auth/login").send({
      email: "login@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.email).toBe("login@example.com");
  });

  it("rejects wrong password with 401", async () => {
    await createTeamMember({ email: "wrongpw@example.com", password: "correctpassword" });

    const res = await request(app).post("/api/auth/login").send({
      email: "wrongpw@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects non-existent email with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ── Protected Routes ─────────────────────────────────────────────────────────

describe("GET /api/auth/me", () => {
  it("returns user info with valid token", async () => {
    const { token } = await createTeamMember({ email: "me@example.com" });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("me@example.com");
  });

  it("rejects request with no token — 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects request with invalid/tampered token — 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalid.token.value");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ── Authorization — Admin-only routes ─────────────────────────────────────────

describe("GET /api/auth/team-members — Admin only", () => {
  it("admin can list team members", async () => {
    const { token } = await createAdmin({ email: "admin@example.com" });
    await createTeamMember({ email: "team1@example.com" });

    const res = await request(app)
      .get("/api/auth/team-members")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("team member cannot list team members — 403", async () => {
    const { token } = await createTeamMember({ email: "team@example.com" });

    const res = await request(app)
      .get("/api/auth/team-members")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ── Admin creates user with specific role ─────────────────────────────────────

describe("POST /api/auth/create-user", () => {
  it("admin can create another user", async () => {
    const { token } = await createAdmin({ email: "admin2@example.com" });

    const res = await request(app)
      .post("/api/auth/create-user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "New Team",
        email: "newteam@example.com",
        password: "password123",
        role: "team",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.role).toBe("team");
  });

  it("team member cannot create users — 403", async () => {
    const { token } = await createTeamMember({ email: "team2@example.com" });

    const res = await request(app)
      .post("/api/auth/create-user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Hacker",
        email: "hacker@example.com",
        password: "password123",
        role: "admin",
      });

    expect(res.status).toBe(403);
  });
});
