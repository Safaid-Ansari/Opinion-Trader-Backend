const logger = require("../config/logger");
const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register User
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check for existing user
        let user = await User.findOne({ email });
        if (user) {
            logger.warn(`[${req.method} ${req.originalUrl}] Registration Failed - Email Already Exists`);
            return res.status(400).json({ message: "User already exists" });
        }

        // Create new user
        user = new User({ name, email, password });
        await user.save();

        logger.info(`[${req.method} ${req.originalUrl}] User Registered Successfully - ${user.email}`);

        // Generate token and respond
        res.status(201).json({ token: generateToken(user), user: { id: user._id, name: user.name, email: user.email } });

    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Registration Error - ${error.message}`);

        // Handle duplicate key error from MongoDB
        if (error.code === 11000) {
            return res.status(400).json({ message: "Email already registered" });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Log successful login
        logger.info(`[${req.method} ${req.originalUrl}] User Logged In - ${user.email}`);

        // Send response with token
        res.json({
            token: generateToken(user),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Login Error - ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    logger.info(`User Fetched!`);
    res.json(req.user);
};

module.exports = { register, login, getProfile };
