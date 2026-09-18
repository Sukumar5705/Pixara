/**
 * tests/helpers.js
 * Shared test utilities: in-memory MongoDB + app instance.
 *
 * We use the real Mongoose models but an in-memory database so no real
 * MongoDB Atlas connection or Backblaze B2 credentials are needed.
 */
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

// Ensure test environment variables are set before any module loads
process.env.JWT_SECRET = "test-secret-for-jest";
process.env.JWT_EXPIRE = "1d";
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/photoshare-test";
process.env.B2_BUCKET_NAME = "test-bucket";

const app = require("../app");

// ── DB helpers ──────────────────────────────────────────────────────────────

/** Connect to a fresh in-memory-style test database */
const connectTestDB = async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: `photoshare-test-${Date.now()}`, // unique per run
    });
  }
};

/** Drop the test database and close connection */
const closeTestDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
};

/** Clear all collections between tests */
const clearTestDB = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// ── Auth helpers ─────────────────────────────────────────────────────────────

const User = require("../models/user");

/**
 * Create a user directly in the DB and return { user, token }
 */
const createUser = async ({ name = "Test User", email, password = "password123", role = "team" } = {}) => {
  if (!email) email = `test-${Date.now()}@example.com`;
  const user = await User.create({ name, email, password, role });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  return { user, token };
};

const createAdmin = async ({ name = "Admin User", email, password = "password123" } = {}) => {
  if (!email) email = `admin-${Date.now()}@example.com`;
  return createUser({ name, email, password, role: "admin" });
};

const createTeamMember = async ({ name = "Team Member", email, password = "password123" } = {}) => {
  if (!email) email = `team-${Date.now()}@example.com`;
  return createUser({ name, email, password, role: "team" });
};

module.exports = {
  app,
  connectTestDB,
  closeTestDB,
  clearTestDB,
  createAdmin,
  createTeamMember,
  createUser,
};
