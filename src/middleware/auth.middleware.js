const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../config/logger");

const authMiddleware = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - No Token Provided`);
            return res.status(401).json({ message: "Access Denied, Token Missing" });
        }

        // Validate Bearer token format
        const tokenParts = authHeader.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - Invalid Token Format`);
            return res.status(401).json({ message: "Invalid Token Format, Please Login Again" });
        }

        const token = tokenParts[1];

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.id) {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - Invalid Token Payload`);
            return res.status(401).json({ message: "Invalid Token, Please Login Again" });
        }

        // Fetch user from DB and attach to request
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - User Not Found`);
            return res.status(401).json({ message: "User Not Found, Please Register Again" });
        }

        req.user = user;
        next();
    } catch (error) {
        // Handle specific JWT errors
        if (error.name === "TokenExpiredError") {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - Token Expired`);
            return res.status(401).json({ message: "Session Expired, Please Login Again" });
        }

        if (error.name === "JsonWebTokenError") {
            logger.warn(`[${req.method} ${req.originalUrl}] Authorization - Invalid Token`);
            return res.status(401).json({ message: "Invalid Token, Please Login Again" });
        }

        // Log other unexpected errors
        logger.error(`[${req.method} ${req.originalUrl}] Authorization - ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};



const adminMiddleware = (req, res, next) => {
    try {
        // Ensure user is authenticated before checking role
        if (!req.user) {
            logger.warn(`[${req.method} ${req.originalUrl}] Access Denied - No User Attached`);
            return res.status(401).json({ message: "Access Denied, Please Login Again" });
        }

        // Ensure role exists
        if (!req.user.role) {
            logger.warn(`[${req.method} ${req.originalUrl}] Access Denied - User Role Missing`);
            return res.status(403).json({ message: "Access Forbidden, User Role Undefined" });
        }

        // Check if the user is an admin
        if (req.user.role !== "admin") {
            logger.warn(`[${req.method} ${req.originalUrl}] Access Forbidden - User Role: ${req.user.role}`);
            return res.status(403).json({ message: "Access Forbidden, Admin Only" });
        }

        next();
    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Admin Middleware Error - ${error.message}`);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { authMiddleware, adminMiddleware };
