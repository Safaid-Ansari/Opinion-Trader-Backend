const express = require("express");
const { placeTrade, getUserTrades, settleTrades } = require("../controllers/trade.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, placeTrade); // Place a trade
router.get("/", authMiddleware, getUserTrades); // Get user's trades
router.post("/settle", authMiddleware, adminMiddleware, settleTrades); // Admin settles trades

module.exports = router;
