import React, { useState } from "react";
import AISelector from "@/components/AISelector";
import ThemeToggle from "@/components/ThemeToggle";
import dynamic from "next/dynamic";
import useSolana from "@/hooks/useSolana";
import AuthModal from "@/components/AuthModal";

// Import SuggestionList as a client-side only component
const SuggestionListNoSSR = dynamic(
  () => import("@/components/SuggestionList"),
  {
    ssr: false,
  }
);

export default function CentralWidget({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  // State for input field and selected AI model
  const [promptText, setPromptText] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek");

  // Using useSolana hook to check wallet connection status
  const { isConnected, walletPublicKey, solBalance, disconnectWallet } =
    useSolana();

  // Callback that will be triggered when a suggestion is clicked.
  const handleSuggestionSelect = (selected: {
    model: string;
    prompt: string;
  }) => {
    setSelectedModel(selected.model);
    setPromptText(selected.prompt);
  };

  // Handler for manually changing the AI model via the select element
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

  const [isCopied, setIsCopied] = useState(false);

  const copyAddress = async () => {
    if (!walletPublicKey) return;
    try {
      await navigator.clipboard.writeText(walletPublicKey);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className={`container ${isCollapsed ? "sidebar-collapsed" : ""}`}>
      <header className="app-header">
        <h1 className="heading">Hybrid.AI</h1>
        <h2 className="sub-heading">
          How can <span className="gradient-text">We</span> help you?
        </h2>
      </header>

      {isConnected && (
        <div className="wallet-header-container">
          <div className="wallet-info">
            <div className="wallet-address" onClick={copyAddress}>
              <span className="material-symbols-rounded">
                account_balance_wallet
              </span>
              <span className="address-text">
                {formatAddress(walletPublicKey)}
                <span className="copy-indicator">
                  {isCopied ? (
                    <span className="material-symbols-rounded animate-pulse">
                      check_circle
                    </span>
                  ) : (
                    <span className="material-symbols-rounded hover-scale"></span>
                  )}
                </span>
              </span>
              <div className="wallet-balance">
                <span className="balance-value">{solBalance.toFixed(2)}</span>
                <span className="balance-currency"> SOL</span>
              </div>
            </div>
            <button
              className="logout-btn"
              onClick={() => disconnectWallet()}
              title="Disconnect wallet"
            >
              <span className="material-symbols-rounded">logout</span>
            </button>
          </div>
        </div>
      )}

      <SuggestionListNoSSR onSelect={handleSuggestionSelect} />

      {/* Chat container with scrollbar style (see CSS snippet below) */}
      <div className="chats-container"></div>

      <div className={`prompt-container ${isCollapsed ? "collapsed" : ""}`}>
        <div className="prompt-wrapper">
          <form action="#" className="prompt-form">
            <input
              type="text"
              placeholder="Ask Hybrid.AI anything..."
              className="prompt-input"
              required
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              disabled={!isConnected} // Disable input if wallet is not connected
            />
            <div className="prompt-actions">
              <button id="send-prompt-btn" className="material-symbols-rounded">
                arrow_upward
              </button>
            </div>
          </form>
          <button type="button" className="material-symbols-rounded">
            stop
          </button>
          <ThemeToggle />
          <button type="button" className="material-symbols-rounded">
            delete
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
        {/* Pass the selected value and change handler to AISelector */}
        <AISelector value={selectedModel} onChange={handleModelChange} />
      </div>

      {/* Render AuthModal as an overlay if wallet is not connected */}
      {!isConnected && <AuthModal />}
    </div>
  );
}
