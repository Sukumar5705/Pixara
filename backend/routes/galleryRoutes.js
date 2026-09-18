const express = require("express");
const router = express.Router();

const {
    publishGallery,
    verifyPinAndGetPhotos,
    getGalleryCredentials,
    deactivateGallery,
} = require("../controllers/galleryController");

const { protect, authorize } = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const { pinLimiter } = require("../middleware/ratelimiter");

// Public route – Customer enters PIN (with rate limiting)
router.post("/:slug/verify", pinLimiter, verifyPinAndGetPhotos);

// All routes below this line require authentication
router.use(protect);

router.post("/publish", authorize("admin"), publishGallery);
router.get("/event/:eventId", validateObjectId("eventId"), authorize("admin"), getGalleryCredentials);
router.patch("/:id/deactivate", validateObjectId("id"), authorize("admin"), deactivateGallery);

module.exports = router;