const logger = require("../config/logger");
const Event = require("../models/Event.model");
const { fetchSportsData } = require("../utils/fetchSportsData");
const { getIo } = require("../config/socket");

// Fetch live events & store in DB
const updateEvents = async (req, res) => {
    try {
        const events = await fetchSportsData();

        // Handle case where API returns no data
        if (!events || events.length === 0) {
            logger.warn(`[${req.method} ${req.originalUrl}] No events received from API`);
            return res.status(404).json({ message: "No new events available" });
        }

        let newEvents = [];
        let skippedEvents = 0;

        // Fetch existing event IDs from DB to avoid redundant queries
        const existingEventIds = new Set(
            (await Event.find({}, "eventId")).map((event) => event.eventId)
        );

        for await (let event of events) {
            if (!event.id || !event.bookmakers) {
                skippedEvents++;
                continue; // Skip invalid events
            }

            // Check if event already exists in the DB
            if (existingEventIds.has(event.id)) {
                skippedEvents++;
                continue; // Skip duplicate events
            }

            // Prepare event for batch insertion
            newEvents.push({
                eventId: event.id,
                name: event.sport_title,
                category: event.sport_key,
                startTime: event.commence_time,
                odds: event.bookmakers[0]?.markets[0]?.outcomes || [],
            });
        }

        // Insert only new events using bulkWrite for performance
        if (newEvents.length > 0) {
            await Event.insertMany(newEvents);
        }

        // Emit events only if new data is available
        if (newEvents.length > 0) {
            getIo().emit("live_events", newEvents);
        }

        logger.info(
            `[${req.method} ${req.originalUrl}] Events updated successfully! New: ${newEvents.length}, Skipped: ${skippedEvents}`
        );

        res.json({
            message: "Events updated successfully!",
            newEventsCount: newEvents.length,
            skippedEventsCount: skippedEvents,
        });
    } catch (error) {
        logger.error(`[${req.method} ${req.originalUrl}] Error updating events: ${error.message}`);
        res.status(500).json({ message: "Internal Server Error" });
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
