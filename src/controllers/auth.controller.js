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
        let user = await User.findOne({ email });

        if (user) {
            logger.warn(`User already exists`);
            return res.status(400).json({ message: "User already exists" });
        }

        user = await User.create({ name, email, password });
        logger.info(`User created: ${user.name}`);
        res.status(201).json({ token: generateToken(user), user });
    } catch (error) {
        logger.error(`Error in register user!: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        logger.info(`User ${user.email} logged in successfully`);
        res.json({ token: generateToken(user), user });
    } catch (error) {
        logger.error(`Error in login user!: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get User Profile
const getProfile = async (req, res) => {
    logger.info(`User Fetched!`);
    res.json(req.user);
};

module.exports = { register, login, getProfile };
