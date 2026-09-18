const bcrypt = require("bcryptjs");
const Gallery = require("../models/gallery");
const Photo = require("../models/photo");
const Event = require("../models/event");
const generatePin = require("../utils/generatepin");
const generateSlug = require("../utils/generateSlug");
const { generateSignedReadUrl } = require("../services/b2Service");

// @desc    Publish a gallery for an event
// @route   POST /api/galleries/publish
// @access  Private/Admin
const publishGallery = async (req, res) => {
    try {
        const { eventId, customPin } = req.body;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "eventId is required",
            });
        }

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        // Check if gallery already exists for this event
        let gallery = await Gallery.findOne({ event: eventId });

        // Generate PIN
        const plainPin = customPin || generatePin(6);
        const hashedPin = await bcrypt.hash(plainPin, 10);

        // Generate unique slug
        let slug = generateSlug();
        while (await Gallery.findOne({ slug })) {
            slug = generateSlug();
        }

        if (gallery) {
            // Update existing gallery
            gallery.slug = slug;
            gallery.pin = hashedPin;
            gallery.isActive = true;
            gallery.publishedAt = Date.now();
            await gallery.save();
        } else {
            // Create new gallery
            gallery = await Gallery.create({
                event: eventId,
                slug,
                pin: hashedPin,
            });
        }

        // Update event status
        event.status = "published";
        await event.save();

        // Use FRONTEND_URL from env (fallback for now)
        const frontendUrl = process.env.FRONTEND_URL || "https://pixara-sigma.vercel.app/";

        res.status(201).json({
            success: true,
            message: "Gallery published successfully",
            data: {
                galleryId: gallery._id,
                slug: gallery.slug,
                pin: plainPin, // return plain PIN only once
                url: `${frontendUrl}/gallery/${gallery.slug}`,
                publishedAt: gallery.publishedAt,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Verify PIN and get published photos
// @route   POST /api/galleries/:slug/verify
// @access  Public
const verifyPinAndGetPhotos = async (req, res) => {
    try {
        const { pin } = req.body;
        const { slug } = req.params;

        if (!pin) {
            return res.status(400).json({
                success: false,
                message: "PIN is required",
            });
        }

        const gallery = await Gallery.findOne({ slug, isActive: true }).populate(
            "event",
            "title description"
        );

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found or inactive",
            });
        }

        // Check PIN
        const isMatch = await bcrypt.compare(pin, gallery.pin);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Incorrect PIN",
            });
        }

        // Get only selected photos
        const photos = await Photo.find({
            event: gallery.event._id,
            isSelected: true,
        }).sort("-createdAt");

        // Generate temporary signed URLs
        const photosWithUrls = await Promise.all(
            photos.map(async (photo) => {
                const url = await generateSignedReadUrl(photo.storageKey);
                return {
                    _id: photo._id,
                    originalName: photo.originalName,
                    url,
                    createdAt: photo.createdAt,
                };
            })
        );

        res.json({
            success: true,
            data: {
                event: {
                    title: gallery.event.title,
                    description: gallery.event.description,
                },
                photos: photosWithUrls,
                totalPhotos: photosWithUrls.length,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get gallery credentials (Admin)
// @route   GET /api/galleries/event/:eventId
// @access  Private/Admin
const getGalleryCredentials = async (req, res) => {
    try {
        const gallery = await Gallery.findOne({ event: req.params.eventId });

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not published yet",
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        res.json({
            success: true,
            data: {
                galleryId: gallery._id,
                slug: gallery.slug,
                url: `${frontendUrl}/gallery/${gallery.slug}`,
                isActive: gallery.isActive,
                publishedAt: gallery.publishedAt,
                // PIN is never returned again
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Deactivate / Unpublish gallery
// @route   PATCH /api/galleries/:id/deactivate
// @access  Private/Admin
const deactivateGallery = async (req, res) => {
    try {
        const gallery = await Gallery.findById(req.params.id);

        if (!gallery) {
            return res.status(404).json({
                success: false,
                message: "Gallery not found",
            });
        }

        gallery.isActive = false;
        await gallery.save();

        res.json({
            success: true,
            message: "Gallery deactivated successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    publishGallery,
    verifyPinAndGetPhotos,
    getGalleryCredentials,
    deactivateGallery,
};
