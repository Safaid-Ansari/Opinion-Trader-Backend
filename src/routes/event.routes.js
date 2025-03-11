const express = require("express");
const { updateEvents, getEvents } = require("../controllers/event.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", getEvents);
router.post("/update", authMiddleware, adminMiddleware, updateEvents);

module.exports = router;
