require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/user");

const seedAdmin = async () => {
    try {
        // Validate required environment variables
        const {
            MONGO_URI,
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
        } = process.env;

        if (!MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }

        if (!ADMIN_NAME) {
            throw new Error("ADMIN_NAME is missing in .env");
        }

        if (!ADMIN_EMAIL) {
            throw new Error("ADMIN_EMAIL is missing in .env");
        }

        if (!ADMIN_PASSWORD) {
            throw new Error("ADMIN_PASSWORD is missing in .env");
        }

        await mongoose.connect(MONGO_URI);

        console.log("Connected to MongoDB...");

        // Check whether an admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            console.log("Admin already exists.");
            console.log(`Admin email: ${existingAdmin.email}`);
            console.log("No new admin was created.");

            await mongoose.disconnect();
            return;
        }

        // Create first admin
        const admin = await User.create({
            name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            role: "admin",
        });

        console.log("Admin created successfully!");
        console.log("-----------------------------");
        console.log(`Name  : ${admin.name}`);
        console.log(`Email : ${admin.email}`);
        console.log(`Role  : ${admin.role}`);
        console.log("-----------------------------");
        console.log("Use the ADMIN_EMAIL and ADMIN_PASSWORD from your .env to log in.");

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error seeding admin:", error.message);

        await mongoose.disconnect().catch(() => { });

        process.exit(1);
    }
};

seedAdmin();