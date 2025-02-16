// HybridAI/src/config/chains.ts

export interface ChainConfig {
  id: number;
  name: string;
  rpcUrls: { [key: string]: string; default: string };
  blockExplorerUrls?: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  iconUrls?: string[];
}

// Create a type alias for compatibility with Privy
export type Chain = ChainConfig;

export const SOLANA_MAINNET: Chain = {
  id: 501,
  name: "Solana",
  rpcUrls: {
    default:
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    helius: process.env.NEXT_PUBLIC_HELIUS_RPC_URL as string,
  },
  blockExplorerUrls: ["https://explorer.solana.com"],
  nativeCurrency: { name: "Solana", symbol: "SOL", decimals: 9 },
  iconUrls: ["https://cryptologos.cc/logos/solana-sol-logo.svg"],
} as const;

export const SUPPORTED_WALLETS = {
  phantom: {
    id: "phantom",
    name: "Phantom",
    iconUrl: "/phantom.svg",
    chains: [SOLANA_MAINNET],
  },
};
