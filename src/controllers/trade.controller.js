const Trade = require("../models/Trade.model");
const Event = require("../models/Event.model");
const logger = require("../config/logger");


// Place a trade
const placeTrade = async (req, res) => {
    try {
        const { eventId, betAmount, selectedOutcome } = req.body;
        const user = req.user;

        // Ensure bet amount is a positive number
        if (betAmount <= 0) {
            logger.warn(`[${req.method} ${req.originalUrl}] Trade Failed - Invalid Bet Amount`);
            return res.status(400).json({ message: "Bet amount must be a positive number" });
        }

        // Check if user has enough balance
        if (betAmount > user.balance) {
            logger.warn(`[${req.method} ${req.originalUrl}] Trade Failed - Insufficient Balance (User: ${user._id})`);
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Check if event exists
        const event = await Event.findOne({ eventId });
        if (!event) {
            logger.warn(`[${req.method} ${req.originalUrl}] Trade Failed - Event Not Found (Event: ${eventId})`);
            return res.status(404).json({ message: "Event not found" });
        }

        // Prevent placing trades on completed events
        // if (event.status === "completed") {
        //     logger.warn(`[${req.method} ${req.originalUrl}] Trade Failed - Event Already Completed (Event: ${eventId})`);
        //     return res.status(400).json({ message: "Cannot place a trade on a completed event" });
        // }

        // Deduct user balance and save
        user.balance -= betAmount;
        await user.save();

        // Create trade
        const trade = await Trade.create({
            user: user._id,
            event: event._id,
            betAmount,
            selectedOutcome,
            status: "pending",
        });
        // Mark event as completed
        // event.status = "completed";
        // await event.save();

        logger.info(`[${req.method} ${req.originalUrl}] Trade Placed - User: ${user._id}, Event: ${eventId}`);
        res.status(201).json({ message: "Trade placed successfully", trade });

    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Trade Error: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get user trades
const getUserTrades = async (req, res) => {
    try {
        const trades = await Trade.find({ user: req.user._id })
            .populate({
                path: "event",
                select: "eventId category name odds status" // Specify fields for the 'event' model
            })
            .populate({
                path: "user",
                select: "name email role balance" // Specify fields for the 'user' model
            })
            .select("betAmount selectedOutcome status payout"); // Specify fields for the 'Trade' model
        logger.info(`Get User Trades Successfully`);
        res.json(trades);
    } catch (error) {
        logger.error(`Trade Error: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Settle trades after event completion
const settleTrades = async (req, res) => {
    try {
        const { eventId, outcome } = req.body;

        // Fetch event details
        const event = await Event.findOne({ eventId });
        if (!event) {
            logger.warn(`[${req.method} ${req.originalUrl}] Trade Settlement Failed - Event Not Found (Event: ${eventId})`);
            return res.status(404).json({ message: "Event not found" });
        }

        // Ensure event is completed before settlement
        // if (event.status !== "completed") {
        //     logger.warn(`[${req.method} ${req.originalUrl}] Trade Settlement Failed - Event Not Completed (Event: ${eventId})`);
        //     return res.status(400).json({ message: "Cannot settle trades for an unfinished event" });
        // }

        // Fetch pending trades for this event
        const trades = await Trade.find({ event: event._id, status: "pending" }).populate("user");


        if (trades.length === 0) {
            logger.warn(`[${req.method} ${req.originalUrl}] No Pending Trades Found (Event: ${eventId})`);
            return res.status(404).json({ message: "No pending trades found for this event" });
        }

        let wonTrades = 0;
        let lostTrades = 0;

        // Process trades
        for await (let trade of trades) {
            if (!trade.user) {
                logger.warn(`[${req.method} ${req.originalUrl}] Trade Settlement Skipped - User Not Found (Trade: ${trade._id})`);
                continue;
            }

            if (trade.selectedOutcome === outcome) {
                trade.status = "won";
                trade.payout = trade.betAmount * 2; // Example payout logic
                trade.user.balance += trade.payout;
                wonTrades++;
            } else {
                trade.status = "lost";
                lostTrades++;
            }

            await trade.user.save();
            await trade.save();
        }

        logger.info(`[${req.method} ${req.originalUrl}] Trades Settled Successfully - Event: ${eventId}, Won: ${wonTrades}, Lost: ${lostTrades}`);
        res.json({ message: "Trades settled successfully", wonTrades, lostTrades });

    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Trade Settlement Error: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { placeTrade, getUserTrades, settleTrades };
