// HybridAI/src/components/AI.tsx

"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAIResponse } from "@/services/ai";
import { usePrivy } from "@privy-io/react-auth";
import { CircularProgress, Alert, Select, MenuItem } from "@mui/material";

const AI = () => {
  const { user } = usePrivy();
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("OpenAI");

  const { data, isLoading, error, isError } = useQuery({
    queryKey: ["ai", query, selectedModel],
    queryFn: () => {
      if (!user?.wallet?.address) {
        throw new Error("Wallet not connected");
      }
      return fetchAIResponse(query, selectedModel, user.wallet.address);
    },
    enabled: !!query && !!user?.wallet?.address,
    retry: (failureCount, error) => {
      return error.message !== "Wallet not connected" && failureCount < 2;
    },
  });

  return (
    <div className="ai-container space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter your query..."
          className="flex-1 p-2 border rounded"
          disabled={!user?.wallet?.address}
        />

        <Select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="min-w-[200px]"
          disabled={!user?.wallet?.address}
        >
          <MenuItem value="OpenAI">GPT-4 Turbo</MenuItem>
          <MenuItem value="DeepSeek">DeepSeek v2</MenuItem>
          <MenuItem value="Claude 3.5">Claude 3.5 Sonnet</MenuItem>
        </Select>
      </div>

      {!user?.wallet?.address && (
        <Alert severity="warning" className="mt-2">
          Please connect your wallet to use AI services
        </Alert>
      )}

      {isLoading && (
        <div className="text-center">
          <CircularProgress />
          <p className="mt-2">Processing your request...</p>
        </div>
      )}

      {isError && (
        <Alert severity="error" className="mt-2">
          {error.message}
        </Alert>
      )}

      {data && (
        <div className="p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">AI Response:</h3>
          <p className="whitespace-pre-wrap">{data}</p>
        </div>
      )}
    </div>
  );
};

export default AI;
