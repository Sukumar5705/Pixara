const Event = require("../models/event");
const User = require("../models/user");

// @desc    Create new event
// @route   POST /api/events
// @access  Private/Admin
const createEvent = async (req, res) => {
    try {
        const { title, description } = req.body;

        const event = await Event.create({
            title,
            description,
            createdBy: req.user._id,
        });

        res.status(201).json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Private
const getEvents = async (req, res) => {
    try {
        let query = {};

        // Team members only see events they are assigned to
        if (req.user.role === "team") {
            query = { teamMembers: req.user._id };
        }

        const events = await Event.find(query)
            .populate("createdBy", "name email")
            .populate("teamMembers", "name email")
            .sort("-createdAt");

        res.json({
            success: true,
            count: events.length,
            data: events,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Private
const getEvent = async (req, res) => {
    try {
        // We reuse the event already fetched & populated by checkEventAccess
        res.json({
            success: true,
            data: req.event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private/Admin
const updateEvent = async (req, res) => {
    try {
        const { title, description, status } = req.body;

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { title, description, status },
            { new: true, runValidators: true }
        )
            .populate("createdBy", "name email")
            .populate("teamMembers", "name email");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add / Update team members of an event
// @route   PUT /api/events/:id/team
// @access  Private/Admin
const updateTeamMembers = async (req, res) => {
    try {
        const { teamMembers } = req.body; // array of user IDs

        if (!Array.isArray(teamMembers)) {
            return res.status(400).json({
                success: false,
                message: "teamMembers must be an array of user IDs",
            });
        }

        // Validate that all users exist and have role "team"
        const users = await User.find({
            _id: { $in: teamMembers },
            role: "team",
        });

        if (users.length !== teamMembers.length) {
            return res.status(400).json({
                success: false,
                message: "One or more user IDs are invalid or not team members",
            });
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            { teamMembers },
            { new: true }
        )
            .populate("createdBy", "name email")
            .populate("teamMembers", "name email");

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        res.json({
            success: true,
            data: event,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private/Admin
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }

        await event.deleteOne();

        res.json({
            success: true,
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = {
    createEvent,
    getEvents,
    getEvent,
    updateEvent,
    updateTeamMembers,
    deleteEvent,
};