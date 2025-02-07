// HybridAI/backend/routes/deposit.js

const express = require("express");
const router = express.Router();

// POST /api/deposit
router.post("/", (req, res) => {
  // This feature is not implemented yet.
  res.status(501).json({ error: "Deposit feature is not yet implemented." });
});

module.exports = router;
