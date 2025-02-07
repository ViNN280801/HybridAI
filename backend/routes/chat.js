// HybridAI/backend/routes/chat.js

const express = require("express");
const router = express.Router();

// Dummy in-memory chat storage (в реальной реализации – Firebase или другая БД)
let chats = [];

// GET /api/chats - retrieve all chats
router.get("/", (req, res) => {
  res.status(200).json({ chats });
});

// POST /api/chats - create a new chat
router.post("/", (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Chat name is required." });
  const newChat = { id: Date.now(), name, messages: [] };
  chats.push(newChat);
  res.status(201).json({ chat: newChat });
});

// PUT /api/chats/:id - update chat name
router.put("/:id", (req, res) => {
  const chatId = parseInt(req.params.id);
  const { name } = req.body;
  const chat = chats.find((c) => c.id === chatId);
  if (!chat) return res.status(404).json({ error: "Chat not found." });
  chat.name = name;
  res.status(200).json({ chat });
});

// DELETE /api/chats/:id - delete a chat
router.delete("/:id", (req, res) => {
  const chatId = parseInt(req.params.id);
  chats = chats.filter((c) => c.id !== chatId);
  res.status(200).json({ message: "Chat deleted." });
});

module.exports = router;
