// HybridAI/backend/server.js

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const aiRoutes = require("./routes/ai");
const chatRoutes = require("./routes/chat");
const depositRoutes = require("./routes/deposit");

const app = express();

// Enable JSON parsing and CORS
app.use(express.json());
app.use(cors());

// Global rate limiter middleware
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per window
  message: { error: "Too many requests, please try again later." },
});
app.use(globalLimiter);

// Register API routes
app.use("/api/ai", aiRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/deposit", depositRoutes);

// Global error handler middleware with detailed error logging
app.use((err, req, res, next) => {
  console.error(`Error in ${__filename}:`, err);
  res.status(500).json({ error: `Internal Server Error: ${err.message}` });
});

// Start server on specified PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
