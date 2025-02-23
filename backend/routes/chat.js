// HybridAI/backend/routes/chat.js

const express = require("express");
const router = express.Router();
const supabase = require("../../src/lib/supabase");

// Retrieves all chats for a user using wallet address to find user_id
router.get("/", async (req, res) => {
  const { walletAddress } = req.query;
  if (!walletAddress)
    return res.status(400).json({ error: "Wallet address required" });

  // Looks up user_id by wallet_address from users table
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("wallet_address", walletAddress)
    .single();

  if (userError)
    return res
      .status(500)
      .json({ error: `User lookup failed: ${userError.message}` });
  if (!user?.id) return res.status(404).json({ error: "User not found" });

  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user.id); // Uses uuid from users table

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ chats: data });
});

router.post("/", (req, res) => {
  res.status(400).json({ error: "Use frontend store to create chats" });
});

router.put("/:id", (req, res) => {
  res.status(400).json({ error: "Use frontend store to rename chats" });
});

router.delete("/:id", (req, res) => {
  res.status(400).json({ error: "Use frontend store to delete chats" });
});

module.exports = router;
