const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
            unique: true, // one gallery per event
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        pin: {
            type: String,
            required: true, // we will store hashed PIN
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        publishedAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Gallery", gallerySchema);