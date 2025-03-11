const axios = require("axios");
const logger = require("../config/logger");
const API_URL = "https://api.the-odds-api.com/v4/sports";
const API_KEY = process.env.ODDS_API_KEY;

// Fetch live events and odds
const fetchSportsData = async () => {
    try {
        const response = await axios.get(`${API_URL}/upcoming/odds`, {
            params: { apiKey: API_KEY, regions: "us", markets: "h2h" },
        });
        return response.data; // Array of event objects
    } catch (error) {
        logger.error(`Error fetching sports data: ${error.message}`);
        return [];
    }
};

module.exports = { fetchSportsData };
