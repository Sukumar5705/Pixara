const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        storageKey: {
            type: String,
            required: true,
            unique: true, // ← Added unique constraint
        },
        size: {
            type: Number,
        },
        mimeType: {
            type: String,
        },
        isSelected: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Optional: Explicit index (good practice)
photoSchema.index({ storageKey: 1 }, { unique: true });

module.exports = mongoose.model("Photo", photoSchema);