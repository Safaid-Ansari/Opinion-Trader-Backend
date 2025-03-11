const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const logger = require("../config/logger");


const authMiddleware = async (req, res, next) => {
    const token = req.headers["authorization"];

    if (!token) {
        logger.error(`[${req.method} ${req.originalUrl}] Authorization - Access Denied, Token not supplied!`);
        return res.status(401).json({ message: "Access Denied" });
    }

    try {
        let parsedToken = token.split(" ")[1]
        const decoded = jwt.verify(parsedToken, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        next();
    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Authorization - ${error}`);
        return res.status(401).json({ statusCode: 401, message: "Your Session has been Timed Out, Please Login Again" });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        logger.error(`[${req.method} ${req.originalUrl}] Access Forbidden - ${req.user.role}`);
        return res.status(403).json({ message: "Access Forbidden" });
    }
    next();
};

module.exports = { authMiddleware, adminMiddleware };
