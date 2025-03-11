const logger = require("../config/logger");
const Event = require("../models/Event.model");
const { fetchSportsData } = require("../utils/fetchSportsData");
const { getIo } = require("../config/socket");

// Fetch live events & store in DB
const updateEvents = async (req, res) => {
    try {
        const events = await fetchSportsData();

        for (let event of events) {
            if (!event.id || !event.bookmakers) continue; // Skip invalid events
            const existingEvent = await Event.findOne({ eventId: event.id });

            if (!existingEvent) {
                await Event.create({
                    eventId: event.id,
                    name: event.sport_title,
                    category: event.sport_key,
                    startTime: event.commence_time,
                    odds: event.bookmakers[0]?.markets[0]?.outcomes || [],
                });
            }
        }

        getIo().emit("live_events", events); // Push real-time update
        logger.info(`Events updated successfully!:`);
        res.json({ message: "Events updated successfully!" });
    } catch (error) {
        logger.error(`Error in update events!: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};


// Get all stored events
const getEvents = async (req, res) => {
    try {
        const events = await Event.find();
        logger.info("Events fetched successfully");
        res.json(events);
    } catch (error) {
        logger.error(`Error in get events!: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { updateEvents, getEvents };
