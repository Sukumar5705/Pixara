const express = require("express");
const router = express.Router();

const {
    getSignedUploadUrl,
    savePhotoMetadata,
    getPhotosByEvent,
    toggleSelectPhoto,
    deletePhoto,
    uploadPhotoProxy,
} = require("../controllers/photoController");

const { protect, authorize } = require("../middleware/auth");
const { checkEventAccess } = require("../middleware/eventAccess");
const validateObjectId = require("../middleware/validateObjectId");

router.use(protect);

// Upload photo via backend proxy — avoids browser CORS on B2 presigned PUTs.
// express.raw() is scoped to this route only; limit set to 100 MB.
router.post(
    "/upload",
    express.raw({ type: () => true, limit: "100mb" }),
    checkEventAccess,
    uploadPhotoProxy
);

// Get signed upload URL (kept for potential server-to-server use)
router.post("/signed-url", checkEventAccess, getSignedUploadUrl);

// Save metadata after upload
router.post("/", checkEventAccess, savePhotoMetadata);

// Get photos of an event
router.get(
    "/event/:eventId",
    validateObjectId("eventId"),
    checkEventAccess,
    getPhotosByEvent
);

// Select / Deselect photo (Admin only)
router.patch(
    "/:id/select",
    validateObjectId("id"),
    authorize("admin"),
    toggleSelectPhoto
);

// Delete photo
router.delete("/:id", validateObjectId("id"), deletePhoto);

module.exports = router;