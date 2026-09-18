const Photo = require("../models/photo");
const {
    generateSignedUploadUrl,
    generateSignedReadUrl,
    uploadBuffer,
    deleteFile,
} = require("../services/b2Service");

// @desc    Get signed URL for uploading a photo
// @route   POST /api/photos/signed-url
// @access  Private
const getSignedUploadUrl = async (req, res) => {
    try {
        const { eventId, originalName, contentType } = req.body;

        if (!eventId || !originalName || !contentType) {
            return res.status(400).json({
                success: false,
                message: "eventId, originalName and contentType are required",
            });
        }

        const { uploadUrl, storageKey } = await generateSignedUploadUrl(
            originalName,
            contentType
        );

        res.json({
            success: true,
            data: {
                uploadUrl,
                storageKey,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get photos of an event
// @route   GET /api/photos/event/:eventId
// @access  Private
const getPhotosByEvent = async (req, res) => {
    try {
        let query = { event: req.params.eventId };

        // Team members can only see their own photos
        if (req.user.role === "team") {
            query.uploadedBy = req.user._id;
        }

        const photos = await Photo.find(query)
            .populate("uploadedBy", "name email")
            .sort("-createdAt");

        // Generate temporary signed URLs
        const photosWithUrls = await Promise.all(
            photos.map(async (photo) => {
                const url = await generateSignedReadUrl(photo.storageKey);
                return {
                    ...photo.toObject(),
                    url,
                };
            })
        );

        res.json({
            success: true,
            count: photosWithUrls.length,
            data: photosWithUrls,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
// @desc    Save photo metadata after successful upload
// @route   POST /api/photos
// @access  Private
const savePhotoMetadata = async (req, res) => {
    try {
        const { eventId, storageKey, originalName, size, mimeType } = req.body;

        if (!eventId || !storageKey || !originalName) {
            return res.status(400).json({
                success: false,
                message: "eventId, storageKey and originalName are required",
            });
        }

        const photo = await Photo.create({
            event: eventId,
            uploadedBy: req.user._id,
            storageKey,
            originalName,
            size,
            mimeType,
        });

        res.status(201).json({
            success: true,
            data: photo,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all photos of an event
// @route   GET /api/photos/event/:eventId
// @access  Private

const toggleSelectPhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: "Photo not found",
            });
        }

        photo.isSelected = !photo.isSelected;
        await photo.save();

        res.json({
            success: true,
            data: photo,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete a photo
// @route   DELETE /api/photos/:id
// @access  Private (Owner or Admin)
const deletePhoto = async (req, res) => {
    try {
        const photo = await Photo.findById(req.params.id);

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: "Photo not found",
            });
        }

        const isOwner = photo.uploadedBy.toString() === req.user._id.toString();
        const isAdmin = req.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this photo",
            });
        }

        // Delete from Backblaze B2
        await deleteFile(photo.storageKey);

        // Delete from database
        await photo.deleteOne();

        res.json({
            success: true,
            message: "Photo deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Upload photo via backend proxy (avoids browser CORS on B2 presigned URLs)
// @route   POST /api/photos/upload
// @access  Private
const uploadPhotoProxy = async (req, res) => {
    try {
        const eventId = req.query.eventId;
        const originalName = req.headers["x-file-name"]
            ? decodeURIComponent(req.headers["x-file-name"])
            : "upload";
        const mimeType =
            req.headers["x-file-type"] ||
            req.headers["content-type"] ||
            "application/octet-stream";
        const size = parseInt(req.headers["x-file-size"] || "0", 10);

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "eventId query param is required",
            });
        }

        const fileBuffer = req.body;

        if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No file data received",
            });
        }

        // Upload to B2 server-side (no CORS restrictions)
        const { storageKey } = await uploadBuffer(originalName, fileBuffer, mimeType);

        // Save metadata
        const photo = await Photo.create({
            event: eventId,
            uploadedBy: req.user._id,
            storageKey,
            originalName,
            size: size || fileBuffer.length,
            mimeType,
        });

        res.status(201).json({ success: true, data: photo });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    getSignedUploadUrl,
    savePhotoMetadata,
    getPhotosByEvent,
    toggleSelectPhoto,
    deletePhoto,
    uploadPhotoProxy,
};