const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
    {
        eventId: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        category: { type: String, required: true }, // Example: "Football"
        startTime: { type: Date, required: true },
        odds: { type: Object, required: true }, // Store odds data
        status: { type: String, enum: ["upcoming", "live", "completed"], default: "upcoming" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Event", EventSchema);
