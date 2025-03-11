const Trade = require("../models/Trade.model");
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const logger = require("../config/logger");


// Place a trade
const placeTrade = async (req, res) => {
    try {
        const { eventId, betAmount, selectedOutcome } = req.body;
        const user = req.user;

        if (betAmount > user.balance) {
            logger.warn(`User ${user._id} has insufficient balance`);
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const event = await Event.findOne({ eventId });
        if (!event) {
            logger.warn(`Trade failed: Event ${eventId} not found`);
            return res.status(404).json({ message: "Event not found" });
        }

        user.balance -= betAmount;
        await user.save();

        const trade = await Trade.create({
            user: user._id,
            event: event._id,
            betAmount,
            selectedOutcome,
            status: "pending",
        });

        logger.info(`User ${user._id} placed trade on event ${eventId}`);
        res.status(201).json(trade);
    } catch (error) {
        logger.error(`Trade Error: ${error.message}`);
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
        const event = await Event.findOne({ eventId });

        if (!event) {
            logger.warn(`No Events found for this event: ${eventId}`);
            return res.status(404).json({ message: "Event not found" });
        }

        const trades = await Trade.find({ event: event._id, status: "pending" });

        if (trades.length <= 0) {
            logger.warn(`No pending trades found for this event: ${event._id}`);
            return res.status(404).json({ message: "No pending trades found for this event " + event._id });
        }

        for await (let trade of trades) {
            const user = await User.findById(trade.user);

            if (trade.selectedOutcome === outcome) {
                trade.status = "won";
                trade.payout = trade.betAmount * 2; // Example payout logic
                user.balance += trade.payout;
            } else {
                trade.status = "lost";
            }

            await trade.save();
            await user.save();
        }
        logger.info(`Trades settled successfully for this event: ${event._id}`);
        res.json({ message: "Trades settled successfully" });
    } catch (error) {
        logger.error(`Error in settle trade: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { placeTrade, getUserTrades, settleTrades };
