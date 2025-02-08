// HybridAI/src/components/WalletButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";
import { SUPPORTED_WALLETS } from "@/config/chains";

export const WalletButton = () => {
  const { user, login, logout, ready } = usePrivy();

  const handleWalletConnection = async () => {
    if (!ready) {
      console.error("Privy is not ready");
      return;
    }
    try {
      if (user && user.wallet) {
        await logout();
      } else {
        await (login as any)();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleWalletConnection}
      disabled={!ready}
    >
      {user?.wallet?.address
        ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
};
