// HybridAI/src/components/ChatInput.tsx

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePrivy } from "@privy-io/react-auth";
import { ModelSelector } from "@/components/ModelSelector";
import { useStore } from "@/lib/store";
import axios from "axios";

const aiTemplates = [
  "Analyze latest crypto market trends",
  "Explain DeFi yield farming",
  "Compare L1 blockchain protocols",
  "Perform a risk assessment on cross-chain interoperability solutions",
  "Evaluate the impact of AI-driven trading algorithms on market liquidity",
  "Provide a deep technical comparison between Solana and Ethereum's consensus mechanisms",
  "Simulate a tokenomics model for a hypothetical Web3 startup",
];

const ChatInput = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = usePrivy();
  const { selectedModel, addMessage, activeChat } = useStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) {
      console.error("Error: message is empty. Enter text please.");
      return;
    }

    if (!user) {
      console.error("Error: user is not authorized.");
      return;
    }

    if (!activeChat) {
      console.error("Error: active chat is missing.");
      return;
    }

    setLoading(true);

    try {
      const userMessage = { role: "user" as const, content: message };
      addMessage(activeChat, userMessage);

      const response = await axios.post("/api/ai", {
        query: message,
        model: selectedModel,
        walletAddress: user.wallet?.address || "N/A",
      });

      const aiResponse = {
        role: "assistant" as const,
        content: response.data.response || "No response from AI.",
      };

      addMessage(activeChat, aiResponse);
    } catch (error) {
      console.error("Error fetching AI response:", error);
      addMessage(activeChat, {
        role: "assistant",
        content: "Error fetching response.",
      });
    } finally {
      setLoading(false);
      setMessage("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 space-y-4">
      {!user && (
        <div className="text-center p-8 rounded-xl bg-gradient-to-b from-background to-muted/50">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent mb-4">
            How can We help you?
          </h1>
          <p className="text-muted-foreground mb-8">
            Smarter Solutions, Powered by Technology and Trust
          </p>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {aiTemplates.map((template) => (
          <Button
            key={template}
            variant="outline"
            className="shrink-0 rounded-full px-4"
            onClick={() => setMessage(template)}
          >
            {template}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="relative flex gap-2">
        <ModelSelector />
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message HybridAI..."
          className="pr-14 h-14 rounded-2xl shadow-lg flex-1"
          disabled={!user || loading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-10 w-10 rounded-xl bg-accent hover:bg-accent/90"
          disabled={!user || !message}
        >
          <Send className="h-5 w-5" />
        </Button>
      </form>
    </div>
  );
};

export default ChatInput;
