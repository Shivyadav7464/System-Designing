
require("dotenv").config();

const express = require("express");
const pool = require("./config/db");
const organizationRoutes = require("./routes/organizationRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const planRoutes = require("./routes/planRoutes");  
//redis connect
const { connectRedis } = require("./config/redis");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

// Enable CORS for all routes
app.use(cors());    

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`Request received on PORT ${PORT}: ${req.method} ${req.url}`);
    next();
});


app.get("/", (req, res) => {
    res.status(200).json({
        message: "B2B SaaS Billing System API is running",
        status: "success",
        server: `Server running on port ${PORT}`
    });
});

app.get("/health/db", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT 1 AS result");

        res.status(200).json({
            message: "MySQL connection successful",
            database: "connected",
            result: rows[0].result
        });
    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

// Organization APIs
app.use("/organizations", organizationRoutes);
    
// Subscription APIs
app.use("/subscriptions", subscriptionRoutes);
    
// Plan APIs
app.use("/plans", planRoutes);


async function startServer() {
    try {
        await connectRedis();

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();





// Code ka quick revision
// - express() — Express server application create karta hai.
// - app.use(express.json()) — incoming JSON request body ko parse karta hai.
// - app.get("/") — root URL par GET request handle karta hai.
// - res.status(200).json(...) — HTTP 200 status ke saath JSON response bhejta hai.
// - app.listen() — server ko port 3000 par start karta hai.