/**
 * tests/photos.test.js
 * Photo upload, metadata, selection, and delete authorization tests.
 *
 * B2 storage is fully mocked — no real uploads occur.
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
const Photo = require("../models/photo");

beforeAll(() => connectTestDB());
afterAll(() => closeTestDB());
afterEach(() => clearTestDB());

// ── Helper: create event + assign team ───────────────────────────────────────
const setupEventWithTeam = async () => {
  const { user: admin, token: adminToken } = await createAdmin({ email: `admin-${Date.now()}@example.com` });
  const { user: team, token: teamToken } = await createTeamMember({ email: `team-${Date.now()}@example.com` });
  const event = await Event.create({
    title: "Photo Test Event",
    createdBy: admin._id,
    teamMembers: [team._id],
  });
  return { admin, adminToken, team, teamToken, event };
};

// ── Signed Upload URL ─────────────────────────────────────────────────────────

describe("POST /api/photos/signed-url", () => {
  it("authorized user can get a signed upload URL", async () => {
    const { adminToken, event } = await setupEventWithTeam();

    const res = await request(app)
      .post("/api/photos/signed-url")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        eventId: event._id.toString(),
        originalName: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("uploadUrl");
    expect(res.body.data).toHaveProperty("storageKey");
  });

  it("team member assigned to event can get signed URL", async () => {
    const { teamToken, event } = await setupEventWithTeam();

    const res = await request(app)
      .post("/api/photos/signed-url")
      .set("Authorization", `Bearer ${teamToken}`)
      .send({
        eventId: event._id.toString(),
        originalName: "team-photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(200);
  });

  it("team member NOT assigned to event is rejected — 403", async () => {
    const { user: admin } = await createAdmin({ email: `admin-${Date.now()}@example.com` });
    const { token: outsiderToken } = await createTeamMember({ email: `outsider-${Date.now()}@example.com` });
    const event = await Event.create({ title: "Private Event", createdBy: admin._id });

    const res = await request(app)
      .post("/api/photos/signed-url")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({
        eventId: event._id.toString(),
        originalName: "photo.jpg",
        contentType: "image/jpeg",
      });

    expect(res.status).toBe(403);
  });

  it("unauthenticated request is rejected — 401", async () => {
    const { user: admin } = await createAdmin({ email: `admin-${Date.now()}@example.com` });
    const event = await Event.create({ title: "Event", createdBy: admin._id });

    const res = await request(app)
      .post("/api/photos/signed-url")
      .send({ eventId: event._id.toString(), originalName: "x.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(401);
  });
});

// ── Save Photo Metadata ───────────────────────────────────────────────────────

describe("POST /api/photos", () => {
  it("assigned team member can save photo metadata", async () => {
    const { teamToken, event } = await setupEventWithTeam();

    const res = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${teamToken}`)
      .send({
        eventId: event._id.toString(),
        storageKey: "photos/abc123.jpg",
        originalName: "team-photo.jpg",
        size: 204800,
        mimeType: "image/jpeg",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.storageKey).toBe("photos/abc123.jpg");
  });

  it("unassigned team member cannot save metadata — 403", async () => {
    const { user: admin } = await createAdmin({ email: `admin-${Date.now()}@example.com` });
    const { token: outsiderToken } = await createTeamMember({ email: `outsider-${Date.now()}@example.com` });
    const event = await Event.create({ title: "Private Event", createdBy: admin._id });

    const res = await request(app)
      .post("/api/photos")
      .set("Authorization", `Bearer ${outsiderToken}`)
      .send({
        eventId: event._id.toString(),
        storageKey: "photos/hack.jpg",
        originalName: "hack.jpg",
      });

    expect(res.status).toBe(403);
  });
});

// ── Get Photos by Event ───────────────────────────────────────────────────────

describe("GET /api/photos/event/:eventId", () => {
  it("admin sees all photos for an event", async () => {
    const { admin, adminToken, team, event } = await setupEventWithTeam();

    await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/p1.jpg",
      originalName: "p1.jpg",
    });
    await Photo.create({
      event: event._id,
      uploadedBy: admin._id,
      storageKey: "photos/p2.jpg",
      originalName: "p2.jpg",
    });

    const res = await request(app)
      .get(`/api/photos/event/${event._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(2);
  });

  it("team member only sees their own photos", async () => {
    const { admin, adminToken, team, teamToken, event } = await setupEventWithTeam();

    await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/mine.jpg",
      originalName: "mine.jpg",
    });
    await Photo.create({
      event: event._id,
      uploadedBy: admin._id,
      storageKey: "photos/admin.jpg",
      originalName: "admin.jpg",
    });

    const res = await request(app)
      .get(`/api/photos/event/${event._id}`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].originalName).toBe("mine.jpg");
  });
});

// ── Toggle Photo Selection (Admin only) ───────────────────────────────────────

describe("PATCH /api/photos/:id/select", () => {
  it("admin can select a photo", async () => {
    const { admin, adminToken, team, event } = await setupEventWithTeam();

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/select.jpg",
      originalName: "select.jpg",
    });

    const res = await request(app)
      .patch(`/api/photos/${photo._id}/select`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.isSelected).toBe(true);
  });

  it("team member cannot select photos — 403", async () => {
    const { admin, teamToken, team, event } = await setupEventWithTeam();

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/noselect.jpg",
      originalName: "noselect.jpg",
    });

    const res = await request(app)
      .patch(`/api/photos/${photo._id}/select`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(res.status).toBe(403);
  });
});

// ── Delete Photo ──────────────────────────────────────────────────────────────

describe("DELETE /api/photos/:id", () => {
  it("admin can delete any photo", async () => {
    const { admin, adminToken, team, event } = await setupEventWithTeam();

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/del.jpg",
      originalName: "del.jpg",
    });

    const res = await request(app)
      .delete(`/api/photos/${photo._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(await Photo.findById(photo._id)).toBeNull();
  });

  it("photo owner (team) can delete their own photo", async () => {
    const { admin, team, teamToken, event } = await setupEventWithTeam();

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: team._id,
      storageKey: "photos/own.jpg",
      originalName: "own.jpg",
    });

    const res = await request(app)
      .delete(`/api/photos/${photo._id}`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(res.status).toBe(200);
  });

  it("different team member cannot delete another member's photo — 403", async () => {
    const { user: admin } = await createAdmin({ email: `a-${Date.now()}@example.com` });
    const { user: owner } = await createTeamMember({ email: `owner-${Date.now()}@example.com` });
    const { token: otherToken } = await createTeamMember({ email: `other-${Date.now()}@example.com` });
    const event = await Event.create({
      title: "Event",
      createdBy: admin._id,
      teamMembers: [owner._id, (await require("../models/user").findOne({ email: { $regex: "other" } }))._id],
    });

    const photo = await Photo.create({
      event: event._id,
      uploadedBy: owner._id,
      storageKey: "photos/notmine.jpg",
      originalName: "notmine.jpg",
    });

    const res = await request(app)
      .delete(`/api/photos/${photo._id}`)
      .set("Authorization", `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });
});
