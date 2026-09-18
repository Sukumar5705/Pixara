const express = require("express");
const router = express.Router();

const {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    updateTeamMembers,
    deleteEvent,
} = require("../controllers/eventController");

const { protect, authorize } = require("../middleware/auth");
const { checkEventAccess } = require("../middleware/eventAccess");
const validateObjectId = require("../middleware/validateObjectId");
const { body } = require("express-validator");
const validate = require("../middleware/validate");

// All routes below require the user to be logged in
router.use(protect);

const eventValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
];

router
    .route("/")
    .post(authorize("admin"), eventValidation, validate, createEvent)
    .get(getEvents); // Admin → all events | Team → only assigned events

router
    .route("/:id")
    .get(validateObjectId("id"), checkEventAccess, getEvent)
    .put(validateObjectId("id"), authorize("admin"), updateEvent)
    .delete(validateObjectId("id"), authorize("admin"), deleteEvent);

router
    .route("/:id/team")
    .put(validateObjectId("id"), authorize("admin"), updateTeamMembers);

module.exports = router;