const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please add a name"],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Please add an email"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please add a valid email"],
        },
        password: {
            type: String,
            required: [true, "Please add a password"],
            minlength: 6,
            select: false, // never returned by default queries
        },
        role: {
            type: String,
            enum: ["admin", "team"],
            default: "team",
        },
    },
    {
        timestamps: true,
    }
);

// Hash the password only when it's new or has changed
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

});

// Compare a plaintext password against the stored hash
userSchema.methods.matchPassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);