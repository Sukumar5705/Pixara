const rateLimit = require("express-rate-limit");
const rateLimit = require("express-rate-limit");

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,  
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    trustProxy: true, 
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
});

const pinLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: {
        success: false,
        message: "Too many PIN attempts. Please try again after 15 minutes.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: true,  
});

module.exports = { authLimiter, apiLimiter, pinLimiter };
