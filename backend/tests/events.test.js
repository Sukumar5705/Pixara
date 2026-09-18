/**
 * tests/events.test.js
 * Event CRUD and authorization tests.
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

const Event = require("../models/event");

beforeAll(() => connectTestDB());
afterAll(() => closeTestDB());
afterEach(() => clearTestDB());

// ── Create Event ──────────────────────────────────────────────────────────────

describe("POST /api/events", () => {
  it("admin can create an event", async () => {
    const { token } = await createAdmin({ email: "admin@example.com" });

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "My Event", description: "Annual photoshoot" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("My Event");
    expect(res.body.data.status).toBe("draft");
  });

  it("team member cannot create an event — 403", async () => {
    const { token } = await createTeamMember({ email: "team@example.com" });

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Forbidden Event" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("event title is required — 400", async () => {
    const { token } = await createAdmin({ email: "admin2@example.com" });

    const res = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${token}`)
      .send({ description: "No title here" });

    expect(res.status).toBe(400);
  });

  it("unauthenticated request is rejected — 401", async () => {
    const res = await request(app)
      .post("/api/events")
      .send({ title: "Ghost Event" });

    expect(res.status).toBe(401);
  });
});

// ── Get Events ────────────────────────────────────────────────────────────────

describe("GET /api/events", () => {
  it("admin sees all events", async () => {
    const { user: admin, token } = await createAdmin({ email: "admin@example.com" });
    await Event.create({ title: "Event 1", createdBy: admin._id });
    await Event.create({ title: "Event 2", createdBy: admin._id });

    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it("team member only sees assigned events", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { user: team, token } = await createTeamMember({ email: "team@example.com" });

    const assigned = await Event.create({
      title: "Assigned",
      createdBy: admin._id,
      teamMembers: [team._id],
    });
    await Event.create({ title: "Unassigned", createdBy: admin._id });

    const res = await request(app)
      .get("/api/events")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0]._id).toBe(assigned._id.toString());
  });
});

// ── Get Single Event ──────────────────────────────────────────────────────────

describe("GET /api/events/:id", () => {
  it("admin can retrieve any event", async () => {
    const { user: admin, token } = await createAdmin({ email: "admin@example.com" });
    const event = await Event.create({ title: "Single Event", createdBy: admin._id });

    const res = await request(app)
      .get(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(event._id.toString());
  });

  it("team member cannot access an event they are not assigned to — 403", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { token } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({ title: "Admin Only Event", createdBy: admin._id });

    const res = await request(app)
      .get(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it("team member can access their assigned event", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { user: team, token } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({
      title: "Assigned Event",
      createdBy: admin._id,
      teamMembers: [team._id],
    });

    const res = await request(app)
      .get(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("returns 404 for non-existent event ID", async () => {
    const { token } = await createAdmin({ email: "admin@example.com" });
    const fakeId = "507f1f77bcf86cd799439011";

    const res = await request(app)
      .get(`/api/events/${fakeId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ── Update Event ──────────────────────────────────────────────────────────────

describe("PUT /api/events/:id", () => {
  it("admin can update an event", async () => {
    const { user: admin, token } = await createAdmin({ email: "admin@example.com" });
    const event = await Event.create({ title: "Original", createdBy: admin._id });

    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Updated Title" });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Updated Title");
  });

  it("team member cannot update an event — 403", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { token } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({ title: "Original", createdBy: admin._id });

    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ title: "Hacked Title" });

    expect(res.status).toBe(403);
  });
});

// ── Team Assignment ───────────────────────────────────────────────────────────

describe("PUT /api/events/:id/team", () => {
  it("admin can assign team members to an event", async () => {
    const { user: admin, token } = await createAdmin({ email: "admin@example.com" });
    const { user: team } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({ title: "Team Event", createdBy: admin._id });

    const res = await request(app)
      .put(`/api/events/${event._id}/team`)
      .set("Authorization", `Bearer ${token}`)
      .send({ teamMembers: [team._id.toString()] });

    expect(res.status).toBe(200);
    expect(res.body.data.teamMembers).toHaveLength(1);
  });

  it("team member cannot manage team assignments — 403", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { user: team, token } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({ title: "Event", createdBy: admin._id });

    const res = await request(app)
      .put(`/api/events/${event._id}/team`)
      .set("Authorization", `Bearer ${token}`)
      .send({ teamMembers: [] });

    expect(res.status).toBe(403);
  });
});

// ── Delete Event ──────────────────────────────────────────────────────────────

describe("DELETE /api/events/:id", () => {
  it("admin can delete an event", async () => {
    const { user: admin, token } = await createAdmin({ email: "admin@example.com" });
    const event = await Event.create({ title: "Delete Me", createdBy: admin._id });

    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const gone = await Event.findById(event._id);
    expect(gone).toBeNull();
  });

  it("team member cannot delete an event — 403", async () => {
    const { user: admin } = await createAdmin({ email: "admin@example.com" });
    const { token } = await createTeamMember({ email: "team@example.com" });
    const event = await Event.create({ title: "Protected Event", createdBy: admin._id });

    const res = await request(app)
      .delete(`/api/events/${event._id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
