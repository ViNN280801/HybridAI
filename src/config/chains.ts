// HybridAI/src/config/chains.ts

export const SOLANA_MAINNET = {
  chainId: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp", // Mainnet-beta
  chainName: "Solana",
  rpcUrls: ["https://api.mainnet-beta.solana.com"],
  blockExplorerUrls: ["https://explorer.solana.com"],
  nativeCurrency: { symbol: "SOL", decimals: 9 },
  iconUrls: ["https://cryptologos.cc/logos/solana-sol-logo.svg"],
};

export const SUPPORTED_WALLETS = {
  phantom: {
    id: "phantom",
    name: "Phantom",
    iconUrl: "/phantom.svg",
    chains: [SOLANA_MAINNET],
  },
};
