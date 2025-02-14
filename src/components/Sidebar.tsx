// HybridAI/src/components/Sidebar.tsx

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import useSolana from "@/hooks/useSolana";
import { useState } from "react";

type SidebarProps = {
  isCollapsed: boolean;
};

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const { theme } = useTheme();
  const { solBalance, walletPublicKey, isConnected, disconnectWallet } = useSolana();
  const [isCopied, setIsCopied] = useState(false);

  const formatAddress = (address: string | null) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

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

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      id="sidebar"
      data-theme={theme}
    >
      <div className="sidebar-header">
        <Link href="/" className="logo-container">
          <span className="logo-text">Hybrid.Ai</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        <a href="#" className="menu-item" id="chatsMenuItem">
          <span className="material-symbols-rounded">chat</span>
          <span className="menu-text">Chats</span>
          {!isCollapsed && (
            <span className="new-chat material-symbols-rounded">add</span>
          )}
        </a>

        <a href="#" className="menu-item">
          <span className="material-symbols-rounded">person</span>
          <span className="menu-text">Account</span>
        </a>

        <a href="#" className="menu-item">
          <span className="material-symbols-rounded">wallet</span>
          <span className="menu-text">Wallet</span>
        </a>
      </div>

      {isConnected && (
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
            <span className="logout-text">Sign Out</span>
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="social-links">
          <a
            href="https://x.com/thehybridai?s=21"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/x_logo.svg"
              width={48}
              height={48}
              alt="X"
              className="social-icon"
            />
            <span className="social-text">Follow Us</span>
          </a>
          <a
            href="https://discord.gg/JKmqwv2W"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/discord_logo.svg"
              width={48}
              height={48}
              alt="X"
              className="social-icon"
            />
            <span className="social-text">Join Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
}
