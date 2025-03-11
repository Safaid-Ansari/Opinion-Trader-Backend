const mongoose = require("mongoose");

const TradeSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        betAmount: { type: Number, required: true },
        selectedOutcome: { type: String, required: true }, // Example: "Team A Wins"
        status: { type: String, enum: ["pending", "won", "lost"], default: "pending" },
        payout: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Trade", TradeSchema);
