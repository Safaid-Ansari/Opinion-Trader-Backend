const express = require("express");
const dotenv = require("dotenv");
const http = require("http");
const cors = require("cors");
dotenv.config();
const PORT = process.env.PORT || 5000;
const bodyParser = require('body-parser')
const connectDB = require("./config/db");
const logger = require("./config/logger");
const { initializeSocket } = require("./config/socket");
const { fetchSportsData } = require('./utils/fetchSportsData')
const errorHandler = require("./middleware/error.middleware");
const authRoutes = require("./routes/auth.routes");
const eventRoutes = require("./routes/event.routes");
const tradeRoutes = require("./routes/trade.routes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// parse application/json
app.use(bodyParser.json())
app.use(errorHandler);
// Create HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const io = initializeSocket(server);

// Push live event updates
const pushLiveUpdates = async () => {
    try {
        const events = await fetchSportsData();
        io.emit("live_events", events); // Emit to all clients
    } catch (error) {
        logger.error(`Error pushing live updates: ${error.message}`);
    }
};

// Update live events every 30 seconds 
// setInterval(pushLiveUpdates, 30000); // why i comment this because we have only limited api calls for free version if it will run every 30 seconds then quota will be left within less than one hour

// routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/trades", tradeRoutes);

// Connect to MongoDB And Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
    });
});

// Routes Placeholder
app.get("/", (req, res) => {
    res.send("Opinion Trading App Backend is Running!");
});

module.exports = app;



