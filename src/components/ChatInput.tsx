// HybridAI/src/components/ChatInput.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TextField,
  Button,
  /* MenuItem, */ Box /* Tooltip */,
} from "@mui/material";
import axios from "axios";
import { usePrivy } from "@privy-io/react-auth";

const aiTemplates = ["Request #1", "Request #2", "Request #3"];

const ChatInput = () => {
  const { user } = usePrivy();
  const [message, setMessage] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");

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
    enabled: false,
    retry: 2,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    refetch();
    setMessage("");
  };

  return (
    <Box className="chat-container">
      <Box className="chat-history">{/* Display chat history here */}</Box>
      <form onSubmit={handleSubmit} className="chat-input">
        <TextField
          label="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!user}
          fullWidth
        />
        <Button variant="contained" type="submit" disabled={!user}>
          Send
        </Button>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="OpenAI">ChatGPT (GPT-4 Turbo)</option>
          <option value="DeepSeek">DeepSeek</option>
          <option value="Claude 3.5">Claude 3.5</option>
          <option value="Gemini">Gemini</option>
        </select>
        {aiTemplates.map((template, idx) => (
          <Button
            key={idx}
            onClick={() => setMessage(template)}
            variant="outlined"
          >
            {template}
          </Button>
        ))}
        {isLoading && <div>Processing your request...</div>}
        {error && <div>{(error as Error).message}</div>}
        {data && <div>AI Response: {data}</div>}
      </form>
    </Box>
  );
};

export default ChatInput;
