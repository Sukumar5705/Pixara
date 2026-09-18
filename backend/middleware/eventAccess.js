const Event = require("../models/event");

const checkEventAccess = async (req, res, next) => {
    try {


        const eventId = req.params.id || req.params.eventId || req.body?.eventId || req.query?.eventId;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: "eventId is required to access this resource",
            });
        }


        const event = await Event.findById(eventId)
            .populate("createdBy", "name email")
            .populate("teamMembers", "name email");


        if (!event) {
            console.log("❌ EVENT NOT FOUND");
            return res.status(404).json({
                success: false,
                message: "Event not found",
            });
        }


        if (req.user.role === "admin") {
            req.event = event;
            return next();
        }

        const isAssigned = event.teamMembers.some(
            (member) => member._id.toString() === req.user._id.toString()
        );

        if (!isAssigned) {
            return res.status(403).json({
                success: false,
                message: "You are not assigned to this event",
            });
        }

        req.event = event;
        next();

    } catch (error) {
        console.error("❌ EVENT ACCESS ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { checkEventAccess };