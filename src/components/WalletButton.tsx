// HybridAI/src/components/WalletButton.tsx

"use client";

import { Button } from "@/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export const WalletButton = () => {
  const { user, login, logout } = usePrivy();

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={user ? logout : login}
    >
      {user?.wallet?.address
        ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
        : "Log In"}
    </Button>
  );
};
