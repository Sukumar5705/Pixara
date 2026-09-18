const express = require("express");
const router = express.Router();

const {
  register,
  createUserByAdmin,
  login,
  getMe,
  getTeamMembers,
} = require("../controllers/authController");

const { protect, authorize } = require("../middleware/auth");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.get("/team-members", protect, authorize("admin"), getTeamMembers);
router.post("/create-user", protect, authorize("admin"), registerValidation, validate, createUserByAdmin);

module.exports = router;