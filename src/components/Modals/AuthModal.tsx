// HybridAI/src/components/AuthModal.tsx

import React from "react";
import useSolana from "@/hooks/useSolana";
import useStore from "@/lib/store";
import ErrorModal from "@/components/Modals/ErrorModal";

/**
 * AuthModal component that forces the user to connect their Phantom wallet.
 * This modal will overlay the interface if the wallet is not connected.
 */
const AuthModal: React.FC = () => {
  const { error } = useStore();
  const { isConnected, connectWallet } = useSolana();
  const [isConnecting, setIsConnecting] = React.useState(false);

  if (isConnected) return null;

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } catch (err) {
      console.error("AuthModal connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="auth-modal">
      <div className="auth-modal-content">
        <h2>Please Connect Your Phantom Wallet</h2>
        <p>
          You must authenticate via your crypto wallet to access the interface.
        </p>
        <button
          className="phantom-connect-btn"
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
        {error && <ErrorModal message={error} />}
      </div>
    </div>
  );
};

export default AuthModal;
