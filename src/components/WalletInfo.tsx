// HybridAI/src/components/WalletInfo.tsx

import { useState } from "react";
import useSolana from "@/hooks/useSolana";

export default function WalletInfo() {
  const { isConnected, walletPublicKey, solBalance, disconnectWallet } =
    useSolana();

  const [isCopied, setIsCopied] = useState(false);

  if (!isConnected) return null;

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
    isConnected && (
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
    )
  );
}
