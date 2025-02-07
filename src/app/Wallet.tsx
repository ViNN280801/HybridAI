// HybridAI/src/pages/Wallet.tsx

import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@mui/material";
import { useState } from "react";

export default function Wallet() {
  const { ready, login } = usePrivy();
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = async () => {
    if (ready) {
      await login();
      setWalletConnected(true);
    }
  };

  return (
    <div className="wallet-content">
      <h2>Connect Your Wallet</h2>
      <p>Your Wallet</p>
      <p>Manage your wallet connection and view your balance</p>
      {!walletConnected ? (
        <Button variant="contained" onClick={handleConnectWallet}>
          Connect Wallet
        </Button>
      ) : (
        <Button variant="contained">Disconnect Wallet</Button>
      )}
    </div>
  );
}
