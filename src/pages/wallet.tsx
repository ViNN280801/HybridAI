// HybridAI/src/pages/wallet.tsx

import React from "react";
import useSolana from "@/hooks/useSolana";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import ErrorModal from "@/components/Modals/ErrorModal";
import useStore from "@/lib/store";

const WalletPage: React.FC = () => {
  const { theme } = useTheme();
  const {
    isConnected,
    walletPublicKey: walletAddress,
    solBalance,
    connectWallet,
    disconnectWallet,
    getExplorerUrl,
  } = useSolana();
  const { error, setError } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    if (!isConnected && !isLoggingOut) {
      connectWallet();
    }
  }, [isConnected, connectWallet, isLoggingOut]);

  const handleToggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
    }
  };

  const handleDepositClick = () => {
    setError("This feature is not yet implemented.");
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await disconnectWallet();
      setError(null);
      console.log("User logged out successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(`Logout failed: ${errorMessage}`);
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="wallet-page_pageContainer" data-theme={theme}>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <main
        className={`wallet-page_walletContainer ${isSidebarCollapsed ? "wallet-page_sidebarCollapsed" : ""}`}
      >
        <div
          className={`central-controls ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
        >
          <button
            className="collapse-btn"
            onClick={handleToggleSidebar}
            aria-label={
              isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <span className="material-symbols-rounded">
              {isSidebarCollapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>
        <h2 className="wallet-page_walletTitle">Your Wallet</h2>
        <div className="wallet-page_walletBox">
          <h3 className="wallet-page_walletSubtitle">Wallet Details</h3>
          <p className="wallet-page_walletDescription">
            Manage your wallet connection and view your balance
          </p>
          <div className="wallet-page_walletInfo">
            {isConnected && walletAddress ? (
              <div className="wallet-page_walletDetails">
                <span className="wallet-page_balance">
                  <Image
                    src="/solana_logo.svg"
                    alt="Solana"
                    width={20}
                    height={20}
                  />
                  <span>
                    {solBalance !== null
                      ? `${solBalance.toFixed(2)} SOL`
                      : "Loading..."}
                  </span>
                </span>
                <div className="wallet-page_walletActions">
                  <Image
                    src="/copy_icon.png"
                    alt="Copy Address"
                    width={20}
                    height={20}
                    className="wallet-page_copyIcon"
                    onClick={handleCopyAddress}
                  />
                  <Link
                    href={getExplorerUrl(walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src="/external_link_icon.png"
                      alt="View on Explorer"
                      width={20}
                      height={20}
                      className="wallet-page_externalLink"
                    />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="wallet-page_noWalletText">No wallet connected</p>
            )}
          </div>
          <div className="wallet-page_buttonGroup">
            <button
              className="wallet-page_walletButton"
              onClick={isConnected ? handleDepositClick : connectWallet}
            >
              {isConnected ? "Deposit Funds" : "Connect Wallet"}
            </button>
            {isConnected && (
              <button
                className="wallet-page_logoutButton"
                onClick={handleLogout}
                aria-label="Logout"
              >
                Logout
              </button>
            )}
          </div>
        </div>
        {error && <ErrorModal message={error} />}
      </main>
    </div>
  );
};

export default WalletPage;
