// HybridAI/src/components/ChatInput.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TextField, Button, MenuItem, Box, Tooltip } from "@mui/material";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";

// Predefined AI request templates
const aiTemplates = ["Request #1", "Request #2", "Request #3"];

const ChatInput = () => {
  const { user } = usePrivy();
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");

  // Query to send AI request (enabled only when message is not empty)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["aiRequest", message, selectedModel],
    queryFn: async () => {
      const response = await axios.post("/api/ai", {
        query: message,
        model: selectedModel,
        walletAddress: user?.wallet?.address,
      });
      return response.data.response;
    },
    enabled: false, // Only enable the query when explicitly triggered
    retry: 2, // Retry up to 2 times on failure
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    refetch();
    setMessage("");
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Tooltip title={!user ? "Please log in to send messages." : ""}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!user}
        />
      </Tooltip>
      <Box sx={{ display: "flex", mt: 1, alignItems: "center" }}>
        <TextField
          select
          label="Select AI Model"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          sx={{ mr: 2, minWidth: 200 }}
        >
          <MenuItem value="OpenAI">ChatGPT (GPT-4 Turbo)</MenuItem>
          <MenuItem value="DeepSeek">DeepSeek</MenuItem>
          <MenuItem value="Claude 3.5">Claude 3.5</MenuItem>
          <MenuItem value="Gemini">Gemini</MenuItem>
        </TextField>
        <Button type="submit" variant="contained" disabled={!message || !user}>
          Send
        </Button>
      </Box>
      <Box sx={{ mt: 1 }}>
        {/* Display AI request templates */}
        {aiTemplates.map((template, idx) => (
          <Button
            key={idx}
            variant="outlined"
            size="small"
            sx={{ mr: 1 }}
            onClick={() => setMessage(template)}
          >
            {template}
          </Button>
        ))}
      </Box>
      {isLoading && <p>Processing your request...</p>}
      {error && <p style={{ color: "red" }}>{(error as Error).message}</p>}
      {data && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
          <strong>AI Response:</strong>
          <pre>{data}</pre>
        </Box>
      )}
    </Box>
  );
};

export default ChatInput;
