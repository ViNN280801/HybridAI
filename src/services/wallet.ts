// HybridAI/src/services/wallet.ts

import { usePrivy } from "@privy-io/react-auth";

export const useWallet = () => {
  const { login } = usePrivy();
  return { connectWallet: login };
};
