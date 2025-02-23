// HybridAI/src/components/CentralWidget.tsx

import React, { useState } from "react";
import AISelector from "@/components/AISelector";
import ThemeToggle from "@/components/ThemeToggle";
import dynamic from "next/dynamic";
import useSolana from "@/hooks/useSolana";
import AuthModal from "@/components/Modals/AuthModal";
import WalletInfo from "@/components/WalletInfo";
import useStore from "@/lib/store";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import Image from "next/image";

// Dynamically import SuggestionList to ensure it only loads on the client side
const SuggestionListNoSSR = dynamic(
  () => import("@/components/SuggestionList"),
  {
    ssr: false,
  }
);

/**
 * CentralWidget serves as the main hub for users to interact with AI models.
 * It manages user input, displays chat history, and handles wallet integration.
 * The component dynamically adjusts its content based on whether a chat is active or not.
 */
export default function CentralWidget({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const [promptText, setPromptText] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek");
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, walletPublicKey } = useSolana();
  const {
    chats,
    activeChat,
    createChat,
    addMessage,
    deleteChat,
    setError,
    setSelectedModel: setGlobalSelectedModel,
  } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  // Find the active chat and determine if it has messages to adjust the UI accordingly
  const activeChatData = chats.find((chat) => chat.id === activeChat);
  const hasMessages = (activeChatData?.messages?.length ?? 0) > 0 || false;

  // When a user selects a suggestion, create a new chat and redirect to its page
  const handleSuggestionSelect = async (selected: {
    model: string;
    prompt: string;
  }) => {
    setSelectedModel(selected.model);
    setGlobalSelectedModel(selected.model);
    setPromptText(selected.prompt);

    // Create a new chat and navigate to its page before sending the prompt
    try {
      await createChat();
      const newChatId = chats[0]?.id; // New chat will be at the start of the array
      if (newChatId) {
        router.push(`/chats/${newChatId}`);
        await sendPromptAutomatically(newChatId, selected.prompt);
      }
    } catch (error) {
      error instanceof Error &&
        setError(
          `Failed to start a new chat: ${error.message}. Please try again.`
        );
    }
  };

  // Automatically send the prompt after navigating to the new chat
  const sendPromptAutomatically = async (chatId: string, prompt: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/ai", {
        query: prompt,
        model: selectedModel,
        walletAddress: walletPublicKey,
      });

      const aiResponse =
        response.data.response.choices?.[0]?.message?.content ||
        "No response from AI";
      await addMessage(chatId, { role: "user", content: prompt });
      await addMessage(chatId, {
        role: "assistant",
        content: aiResponse,
        model: selectedModel,
      });
      setPromptText(""); // Clear the input after sending
    } catch (error) {
      error instanceof Error &&
        setError(
          `Error processing your request: ${error.message}. Please try again.`
        );
    } finally {
      setIsLoading(false);
    }
  };

  // Update the selected AI model and sync it with the global state
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setGlobalSelectedModel(newModel);
  };

  // Handle manual submission of prompts from the input field
  const handleSendPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !walletPublicKey || !activeChat) {
      setError("Please connect your wallet and select a chat.");
      return;
    }

    if (!promptText.trim()) {
      setError("Please enter a prompt before sending.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/ai", {
        query: promptText,
        model: selectedModel,
        walletAddress: walletPublicKey,
      });

      const aiResponse =
        response.data.response.choices?.[0]?.message?.content ||
        "No response from AI";
      await addMessage(activeChat, { role: "user", content: promptText });
      await addMessage(activeChat, {
        role: "assistant",
        content: aiResponse,
        model: selectedModel,
      });
      setPromptText(""); // Clear the input after successful submission
    } catch (error) {
      error instanceof Error &&
        setError(
          `Error sending your message: ${error.message}. Please try again.`
        );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete the active chat and redirect to the homepage
  const handleDeleteChat = () => {
    if (pathname.startsWith("/chats/") && activeChat) {
      deleteChat(activeChat);
      router.push("/");
    }
  };

  // Stop an ongoing AI request and mark it as interrupted
  const handleStopLoading = async () => {
    if (isLoading && activeChat) {
      setIsLoading(false);
      await addMessage(activeChat, {
        role: "assistant",
        content: "Interrupted",
        model: selectedModel,
      });
    }
  };

  // Format timestamps for display in a clean HH:MM format
  const formatTimestamp = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  // Render the chat messages with proper formatting and indicators
  const renderChatMessages = () => {
    if (!activeChat || !activeChatData) return null;
    return (
      <div
        className="chats-container chat-messages"
        style={{ overflowY: "auto", maxHeight: "60vh" }}
      >
        {activeChatData.messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.role === "user" ? "user-message" : "ai-message"}`}
          >
            <div className="message-content">
              {message.role === "assistant" && (
                <Image
                  src="/chat_icon.png"
                  alt="AI icon"
                  width={24}
                  height={24}
                  className="message-icon"
                />
              )}
              <span className="message-text">
                <strong>{message.role === "user" ? "You" : "AI"}:</strong>{" "}
                {message.content}
                {message.model && (
                  <span className="model-indicator">
                    {" "}
                    (via {message.model})
                  </span>
                )}
                {message.content === "Interrupted" && (
                  <span className="interrupted-indicator"> 🚧</span>
                )}
              </span>
              <span
                className={`timestamp ${message.role === "user" ? "user-timestamp" : "ai-timestamp"}`}
              >
                {formatTimestamp(message.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`container ${isCollapsed ? "sidebar-collapsed" : ""}`}
      style={{ overflowY: "auto", maxHeight: "100vh" }}
    >
      {/* Show the header only if there are no messages yet */}
      {!hasMessages && pathname === "/" && (
        <header className="app-header">
          <h1 className="heading">Hybrid.AI</h1>
          <h2 className="sub-heading">
            How can <span className="gradient-text">We</span> help you?
          </h2>
        </header>
      )}

      <WalletInfo />
      {/* Show suggestions only on the homepage and when there are no messages */}
      {!hasMessages && pathname === "/" && (
        <SuggestionListNoSSR onSelect={handleSuggestionSelect} />
      )}

      {/* Render chat messages if a chat is active */}
      {activeChat && renderChatMessages()}

      <div className={`prompt-container ${isCollapsed ? "collapsed" : ""}`}>
        <div className="prompt-wrapper">
          <form action="#" className="prompt-form" onSubmit={handleSendPrompt}>
            <input
              type="text"
              placeholder="Ask Hybrid.AI anything..."
              className="prompt-input"
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={!isConnected || !activeChat}
              title={!isConnected ? "Please log in to send messages." : ""}
              style={{ overflowY: "auto", maxHeight: "100px" }}
            />
            <div className="prompt-actions">
              <button
                id="send-prompt-btn"
                className="material-symbols-rounded"
                disabled={isLoading || !activeChat || !promptText.trim()}
                type="submit"
              >
                {isLoading ? "loading" : "arrow_upward"}
              </button>
            </div>
          </form>
          <button
            type="button"
            className="material-symbols-rounded"
            onClick={handleDeleteChat}
            disabled={!activeChat || !pathname.startsWith("/chats/")}
          >
            delete
          </button>
          <ThemeToggle />
          <button
            type="button"
            id="stop-response-btn"
            className="material-symbols-rounded"
            onClick={handleStopLoading}
            disabled={!isLoading}
          >
            stop
          </button>
        </div>
        <p className="disclaimer-text">
          Hybrid.AI can make mistakes. Use critical thinking before accepting
          the information :)
        </p>
      </div>

      <div className="central-controls">
        <button
          className="collapse-btn"
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-rounded">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
        <AISelector value={selectedModel} onChange={handleModelChange} />
      </div>

      {!isConnected && <AuthModal />}
    </div>
  );
}
