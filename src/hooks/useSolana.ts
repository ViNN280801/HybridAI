// HybridAI/src/hooks/useSolana.ts

import { useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

export default function useSolana() {
  const [solBalance, setSolBalance] = useState(0);
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl("mainnet-beta");
  const connection = new Connection(rpcUrl, "confirmed");

  const fetchBalance = async (walletAddress: string) => {
    try {
      const publicKey = new PublicKey(walletAddress);
      const lamports = await connection.getBalance(publicKey);
      const sol = lamports / 1_000_000_000;
      setSolBalance(sol);
      console.log(`Wallet address: ${walletAddress}, Balance: ${sol} SOL`);
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
    }
  };

  return { solBalance, fetchBalance };
}
