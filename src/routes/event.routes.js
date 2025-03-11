const express = require("express");
const { updateEvents, getEvents } = require("../controllers/event.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");
const router = express.Router();


// protected routes for retrieving events
router
    .route('/')
    .get(getEvents);

// Admin routes for updating events
router
    .route('/update')
    .post(
        authMiddleware,
        adminMiddleware,
        updateEvents);

module.exports = router;
