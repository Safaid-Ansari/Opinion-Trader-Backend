const express = require("express");
const { placeTrade, getUserTrades, settleTrades } = require("../controllers/trade.controller");
const { authMiddleware, adminMiddleware } = require("../middleware/auth.middleware");
const { placeTradeValidator } = require("../validation/trade.validator");

const router = express.Router();


// protected routes for placing trades
router
    .route('/')
    .post(
        authMiddleware,
        placeTradeValidator,
        placeTrade);

// protected routes for retrieving user trades
router
    .route('/')
    .get(
        authMiddleware,
        getUserTrades);

// Admin routes for settling trades
router
    .route('/settle')
    .post(
        authMiddleware,
        adminMiddleware,
        settleTrades);

module.exports = router;
