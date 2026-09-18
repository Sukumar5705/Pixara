/**
 * app.js — Express application factory (no listen call).
 * Imported by server.js (which calls listen) and by Supertest in tests.
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { authLimiter } = require("./middleware/ratelimiter");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "https://pixara-sigma.vercel.app/",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Photo Share API is running...",
  });
});

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/photos", require("./routes/photoRoutes"));
app.use("/api/galleries", require("./routes/galleryRoutes"));

app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

app.use(errorHandler);

module.exports = app;
