/**
 * tests/galleries.test.js
 * Gallery publish, deactivate, PIN verification, and security tests.
 *
 * B2 service is mocked so no real signed read URLs are needed.
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
const Gallery = require("../models/gallery");

beforeAll(() => connectTestDB());
afterAll(() => closeTestDB());
afterEach(() => clearTestDB());

// ── Helper: create a complete setup (event + selected photos) ─────────────────
const setupPublishable = async () => {
  const { user: admin, token: adminToken } = await createAdmin({
    email: `admin-${Date.now()}@example.com`,
  });
  const event = await Event.create({ title: "Gallery Event", createdBy: admin._id });

  // Create a selected photo
  await Photo.create({
    event: event._id,
    uploadedBy: admin._id,
    storageKey: "photos/selected.jpg",
    originalName: "selected.jpg",
    isSelected: true,
  });

  return { admin, adminToken, event };
};

// ── Publish Gallery ───────────────────────────────────────────────────────────

describe("POST /api/galleries/publish", () => {
  it("admin can publish a gallery and receives plain PIN", async () => {
    const { adminToken, event } = await setupPublishable();

    const res = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("pin");
    expect(res.body.data).toHaveProperty("slug");
    expect(res.body.data).toHaveProperty("url");
  });

  it("admin can publish with a custom PIN", async () => {
    const { adminToken, event } = await setupPublishable();

    const res = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString(), customPin: "123456" });

    expect(res.status).toBe(201);
    expect(res.body.data.pin).toBe("123456");
  });

  it("team member cannot publish a gallery — 403", async () => {
    const { event } = await setupPublishable();
    const { token: teamToken } = await createTeamMember({
      email: `team-${Date.now()}@example.com`,
    });

    const res = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${teamToken}`)
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(403);
  });

  it("unauthenticated request cannot publish — 401", async () => {
    const { event } = await setupPublishable();

    const res = await request(app)
      .post("/api/galleries/publish")
      .send({ eventId: event._id.toString() });

    expect(res.status).toBe(401);
  });

  it("publishing without eventId returns 400", async () => {
    const { adminToken } = await setupPublishable();

    const res = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("republishing generates a new slug and PIN", async () => {
    const { adminToken, event } = await setupPublishable();

    const first = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    const second = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    expect(second.status).toBe(201);
    // Slug is regenerated on each publish
    expect(second.body.data.slug).not.toBe(first.body.data.slug);
  });
});

// ── PIN Verification ──────────────────────────────────────────────────────────

describe("POST /api/galleries/:slug/verify", () => {
  const publishAndGetCreds = async () => {
    const { adminToken, event } = await setupPublishable();
    const publishRes = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString(), customPin: "654321" });

    return {
      slug: publishRes.body.data.slug,
      pin: publishRes.body.data.pin,
      event,
    };
  };

  it("correct PIN returns gallery photos", async () => {
    const { slug, pin } = await publishAndGetCreds();

    const res = await request(app)
      .post(`/api/galleries/${slug}/verify`)
      .send({ pin });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("photos");
    expect(res.body.data).toHaveProperty("event");
    // Only selected photos are returned
    expect(res.body.data.photos.length).toBeGreaterThanOrEqual(1);
  });

  it("wrong PIN returns 401", async () => {
    const { slug } = await publishAndGetCreds();

    const res = await request(app)
      .post(`/api/galleries/${slug}/verify`)
      .send({ pin: "000000" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("missing PIN returns 400", async () => {
    const { slug } = await publishAndGetCreds();

    const res = await request(app)
      .post(`/api/galleries/${slug}/verify`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("non-existent slug returns 404", async () => {
    const res = await request(app)
      .post("/api/galleries/no-such-gallery/verify")
      .send({ pin: "123456" });

    expect(res.status).toBe(404);
  });

  it("deactivated gallery returns 404", async () => {
    const { slug } = await publishAndGetCreds();

    // Find and deactivate
    const gallery = await Gallery.findOne({ slug });
    gallery.isActive = false;
    await gallery.save();

    const res = await request(app)
      .post(`/api/galleries/${slug}/verify`)
      .send({ pin: "654321" });

    expect(res.status).toBe(404);
  });

  it("only selected (isSelected=true) photos are returned", async () => {
    const { slug, pin, event } = await publishAndGetCreds();

    // Add an unselected photo to same event
    const { user: admin } = await require("../models/user").findOne({ role: "admin" })
      .then(() => ({ user: null }));

    await Photo.create({
      event: event._id,
      uploadedBy: event.createdBy || event._id,
      storageKey: "photos/unselected.jpg",
      originalName: "unselected.jpg",
      isSelected: false,
    });

    const res = await request(app)
      .post(`/api/galleries/${slug}/verify`)
      .send({ pin });

    // Only the originally selected photo should be returned
    const allSelected = res.body.data.photos.every((p) => p.originalName !== "unselected.jpg");
    expect(allSelected).toBe(true);
  });
});

// ── Get Gallery Credentials (Admin) ──────────────────────────────────────────

describe("GET /api/galleries/event/:eventId", () => {
  it("admin can retrieve gallery credentials after publishing", async () => {
    const { adminToken, event } = await setupPublishable();

    await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    const res = await request(app)
      .get(`/api/galleries/event/${event._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("slug");
    expect(res.body.data).toHaveProperty("url");
    expect(res.body.data).not.toHaveProperty("pin"); // PIN is never returned again
  });

  it("returns 404 when gallery has not been published", async () => {
    const { adminToken, event } = await setupPublishable();

    const res = await request(app)
      .get(`/api/galleries/event/${event._id}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it("team member cannot get gallery credentials — 403", async () => {
    const { adminToken, event } = await setupPublishable();
    const { token: teamToken } = await createTeamMember({
      email: `team-${Date.now()}@example.com`,
    });

    await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    const res = await request(app)
      .get(`/api/galleries/event/${event._id}`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(res.status).toBe(403);
  });
});

// ── Deactivate Gallery ────────────────────────────────────────────────────────

describe("PATCH /api/galleries/:id/deactivate", () => {
  it("admin can deactivate a gallery", async () => {
    const { adminToken, event } = await setupPublishable();

    const publishRes = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    const galleryId = publishRes.body.data.galleryId;

    const deactivateRes = await request(app)
      .patch(`/api/galleries/${galleryId}/deactivate`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(deactivateRes.status).toBe(200);
    expect(deactivateRes.body.success).toBe(true);

    // Verify deactivation
    const gallery = await Gallery.findById(galleryId);
    expect(gallery.isActive).toBe(false);
  });

  it("team member cannot deactivate a gallery — 403", async () => {
    const { adminToken, event } = await setupPublishable();
    const { token: teamToken } = await createTeamMember({
      email: `team-${Date.now()}@example.com`,
    });

    const publishRes = await request(app)
      .post("/api/galleries/publish")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ eventId: event._id.toString() });

    const galleryId = publishRes.body.data.galleryId;

    const res = await request(app)
      .patch(`/api/galleries/${galleryId}/deactivate`)
      .set("Authorization", `Bearer ${teamToken}`);

    expect(res.status).toBe(403);
  });
});
