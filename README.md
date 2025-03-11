# Opinion Trading App - Backend

## Description
The Opinion Trading App backend is built using Node.js (Express.js) with MongoDB, Socket.io, and JWT authentication. It provides real-time sports event data, allows users to place trades, and enables trade settlement by admins.

🚀 Features
✅ User Authentication (JWT-based login & signup)
✅ Admin Panel (Manage events & settle trades)
✅ Live Sports Data Fetching (Free API)
✅ WebSocket (Socket.io) for Live Updates
✅ Trade Execution & Settlement
✅ MongoDB Database with Mongoose
✅ Logging & Error Handling (Winston)


🛠 Tech Stack
Backend: Node.js (Express.js)
Database: MongoDB (Mongoose ORM)
WebSockets: Socket.io
Authentication: JWT (JSON Web Token)
API Consumption: Axios (Fetch sports data)
Logging: Winston


📂 Project Structure
opinion-trading-app
│── src
│   ├── config
│   │   ├── db.js           # MongoDB Connection
│   │   ├── logger.js       # Winston Logger
│   │   ├── socket.js       # WebSocket (Socket.io)
│   ├── controllers
│   │   ├── auth.controller.js
│   │   ├── event.controller.js
│   │   ├── trade.controller.js
│   ├── middleware
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   ├── models
│   │   ├── User.model.js
│   │   ├── Event.model.js
│   │   ├── Trade.model.js
│   ├── routes
│   │   ├── auth.routes.js
│   │   ├── event.routes.js
│   │   ├── trade.routes.js
│   ├── utils
│   │   ├── fetchSportsData.js  # Sports API Integration
│   ├── index.js  # Main server file
│── .env
│── package.json
│── README.md


🔑 Environment Variables (.env)

PORT=5000
MONGO_URI=mongodb://localhost:27017/opinion_trading
JWT_SECRET=your_jwt_secret
ODDS_API_KEY=your_api_key_here


📌 API Endpoints

🔹 Authentication APIs
  Endpoint	          Method	  Auth	   Description
/api/auth/register	  POST	    ❌	      Register a new user
/api/auth/login	      POST	    ❌	      User login (returns JWT)
/api/auth/profile	    GET	      ✅	      Get user profile


🔹 Event APIs
  Endpoint	        Method	    Auth	        Description
/api/events	        GET	        ❌	           Get all stored events
/api/events/update	POST	      ✅ (Admin)	   Fetch & store live sports events


🔹 Trade APIs   
  Endpoint	           Method	     Auth	          Description
/api/trades	           POST	       ✅	           Place a trade
/api/trades	           GET	       ✅	           Get user's trade history
/api/trades/settle	   POST	       ✅(Admin)	     Settle trades & update balances


🔧 Setup & Run the Project

1️⃣ Clone the Repository
git clone https://github.com/your-username/opinion-trading-app.git
cd opinion-trading-app

2️⃣ Install Dependencies
npm install

3️⃣ Run the Server
npm start

4️⃣ Run Tests
 npm run test



3️⃣ Challenges & Solutions
🛑 Challenge 1: WebSocket (io.emit Undefined Error)
Issue
WebSocket (io.emit) was returning "Cannot read properties of undefined (reading 'emit')".

Solution
Created a singleton WebSocket instance (getIo()) in socket.js to ensure io is accessible across the app.

✅ Fix Implemented:
```js
const getIo = () => {
    if (!io) throw new Error("Socket.io not initialized!");
    return io;
};
```

🛑 Challenge 2: Ensuring Live Data Fetching Works Correctly

Issue
The sports API has rate limits and sometimes returns empty responses.

Solution
Added retry logic in fetchSportsData.js using Axios.
Filtered out empty events before storing them.

✅ Fix Implemented:

```js
if (!event.id || !event.bookmakers) continue; // Skip invalid events
```


🛑 Challenge 3: Trade Settlement & Payouts

Issue
Users weren’t receiving payouts correctly during trade settlement.

Solution
Implemented a trade settlement function that:
Checks the selected outcome
Updates the trade status (won/lost)
Credits balance for winners

✅ Fix Implemented:

```js

if (trade.selectedOutcome === outcome) {
    trade.status = "won";
    trade.payout = trade.betAmount * 2;
    user.balance += trade.payout;
} else {
    trade.status = "lost";
}

```
