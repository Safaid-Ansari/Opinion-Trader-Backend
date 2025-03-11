const express = require("express");
const { register, login, getProfile } = require("../controllers/auth.controller");
const { authMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();


//  routes for register the user
router
    .route('/register')
    .post(register);

//  routes for login the user
router
    .route('/login')
    .post(login);

// protected routes for retrieving user profile
router
    .route('/profile')
    .get(
        authMiddleware,
        getProfile);

module.exports = router;
