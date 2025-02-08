// HybridAI/backend/routes/ai.js

const express = require("express");
const axios = require("axios");
const router = express.Router();

// API keys from environment variables
const { OPENAI_API_KEY, DEEPSEEK_API_KEY, CLAUDE_API_KEY, GEMINI_API_KEY } =
  process.env;

// POST /api/ai
router.post("/", async (req, res, next) => {
  try {
    const { query, model, walletAddress } = req.body;
    if (!query || !model || !walletAddress) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let apiUrl = "";
    let apiKey = "";

    // Select the appropriate API endpoint and key
    switch (model) {
      case "OpenAI":
        apiUrl = "https://api.openai.com/v1/chat/completions";
        apiKey = OPENAI_API_KEY;
        break;
      case "DeepSeek":
        apiUrl = "https://api.deepseek.com/query";
        apiKey = DEEPSEEK_API_KEY;
        break;
      case "Claude 3.5":
        apiUrl = "https://api.anthropic.com/complete";
        apiKey = CLAUDE_API_KEY;
        break;
      case "Gemini":
        apiUrl = "https://api.gemini.com/v1/complete";
        apiKey = GEMINI_API_KEY;
        break;
      default:
        return res.status(400).json({ error: "Unsupported model selected." });
    }

    // Forward the query to the AI service
    const response = await axios.post(
      apiUrl,
      { query },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ response: response.data });
  } catch (error) {
    console.error(
      `Error in routes/ai.js, line ${error.lineNumber || "unknown"}:`,
      error
    );
    next(new Error(`Error in AI route: ${error.message}`));
  }
});

module.exports = router;
