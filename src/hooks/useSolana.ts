// HybridAI/src/hooks/useSolana.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import {
  WalletAdapter,
  WalletAdapterEvents,
} from "@solana/wallet-adapter-base";
import { EventEmitter } from "@solana/wallet-adapter-base";
import useStore from "@/lib/store";
import {
  createOrUpdateUser,
  getCurrentUser,
} from "@/services/firebaseController";
import { SOLANA_MAINNET } from "@/config/chains";

// Define the interface for the Phantom provider
interface SolanaProvider {
  isPhantom?: boolean;
  isConnected: boolean;
  publicKey?: PublicKey;
  connect: () => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (
    event: "connect" | "disconnect",
    handler: (publicKey: PublicKey) => void
  ) => void;
  off: (
    event: "connect" | "disconnect",
    handler: (publicKey: PublicKey) => void
  ) => void;
}

// Extend the global Window interface
declare global {
  interface Window {
    solana?: SolanaProvider;
    phantom?: {
      solana: PhantomWalletAdapter;
    };
  }
}

interface PhantomWalletAdapter
  extends WalletAdapter,
    EventEmitter<WalletAdapterEvents> {
  isConnected: boolean;
  isPhantom?: boolean;
  publicKey: PublicKey | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const PHANTOM_DOWNLOAD_LINKS: Record<string, string> = {
  chrome:
    "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
  firefox: "https://addons.mozilla.org/firefox/addon/phantom-app/",
  safari: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
  other: "https://phantom.app/download",
};

// Interface for data saved in localStorage
interface CachedWallet {
  publicKey: string;
  timestamp: number;
}

export default function useSolana() {
  const { setError } = useStore();
  const [currentRpcIndex, setCurrentRpcIndex] = useState<number>(0);

  const rpcUrls = useMemo(() => Object.values(SOLANA_MAINNET.rpcUrls), []);

  // Connection to Solana RPC
  const connection = useMemo(
    () =>
      new Connection(rpcUrls[currentRpcIndex], {
        commitment: "confirmed",
        disableRetryOnRateLimit: false,
        confirmTransactionInitialTimeout: 60000,
      }),
    [rpcUrls, currentRpcIndex]
  );

  // Function to switch to the next RPC endpoint
  const switchToNextRpc = useCallback(() => {
    setCurrentRpcIndex((prevIndex) => (prevIndex + 1) % rpcUrls.length);
    return rpcUrls[(currentRpcIndex + 1) % rpcUrls.length];
  }, [rpcUrls, currentRpcIndex]);

  const [solBalance, setSolBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);

  // Define the browser for the Phantom download link
  const getBrowser = (): "chrome" | "firefox" | "safari" | "other" => {
    const ua = navigator.userAgent;
    if (ua.includes("Firefox")) return "firefox";
    if (ua.includes("Chrome")) return "chrome";
    if (ua.includes("Safari")) return "safari";
    return "other";
  };

  /**
   * handlePhantomError – output error or recommendation to install Phantom.
   */
  const handlePhantomError = (error: Error) => {
    const browser = getBrowser();
    if (!window.phantom) {
      setError(
        `Need to install Phantom Wallet. Download for ${browser}: ${PHANTOM_DOWNLOAD_LINKS[browser]}`
      );
      return;
    }
    setError(error.message);
  };

  const getPhantomNotInstalledError = (): string => {
    const browser = getBrowser();
    return `Phantom Wallet is required. Install for ${browser}: ${PHANTOM_DOWNLOAD_LINKS[browser]}`;
  };

  const fetchBalance = useCallback(
    async (publicKey: string, retryCount = 0): Promise<void> => {
      const MAX_RETRIES = rpcUrls.length;

      try {
        const balance = await connection.getBalance(new PublicKey(publicKey));
        setSolBalance(balance / 1_000_000_000);
        setError(null);
      } catch (error) {
        if (retryCount < MAX_RETRIES - 1) {
          const nextRpc = switchToNextRpc();
          console.warn(`RPC connection failed. Switching to ${nextRpc}`);
          return fetchBalance(publicKey, retryCount + 1);
        }

        setError(
          `Failed to connect to all RPC endpoints. Please try again later.`
        );
        console.error("Error getting balance:", error);
      }
    },
    [connection, switchToNextRpc, setError, rpcUrls.length]
  );

  // Update handleWalletConnection with reconnection mechanism
  const handleWalletConnection = useCallback(
    async (publicKey: string, retryCount = 0): Promise<void> => {
      const MAX_RETRIES = rpcUrls.length;

      try {
        await createOrUpdateUser({
          id: publicKey,
          cryptowallet: publicKey,
          emails: [],
          chatIds: [],
        });
        setWalletPublicKey(publicKey);
        setIsConnected(true);
        await fetchBalance(publicKey);
        const cachedData: CachedWallet = {
          publicKey,
          timestamp: Date.now(),
        };
        localStorage.setItem("cachedWallet", JSON.stringify(cachedData));
      } catch (error) {
        if (retryCount < MAX_RETRIES - 1) {
          const nextRpc = switchToNextRpc();
          console.warn(`Connection failed. Switching to ${nextRpc}`);
          return handleWalletConnection(publicKey, retryCount + 1);
        }

        setWalletPublicKey(null);
        setIsConnected(false);
        throw error;
      }
    },
    [fetchBalance, switchToNextRpc, rpcUrls.length]
  );

  /**
   * connectWallet tries to connect to Phantom.
   * If the user rejects the request or Phantom is not installed – outputs an error.
   */
  async function connectWallet() {
    const originalConsoleError = console.error.bind(console);
    try {
      console.error = (...args: unknown[]) => {
        const isUserRejection = args.some(
          (arg) =>
            typeof arg === "string" && arg.includes("User rejected the request")
        );
        if (!isUserRejection) originalConsoleError(...args);
      };

      if (!window.phantom) {
        setError(
          `Need to install Phantom Wallet. Download for ${getBrowser()}: ${PHANTOM_DOWNLOAD_LINKS[getBrowser()]}`
        );
        return;
      }
      if (!window.phantom.solana) {
        throw new Error("phantom_not_installed");
      }

      const provider = window.phantom.solana;
      setError(null);

      if (!provider.isConnected) {
        try {
          await provider.connect();
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes("User rejected the request")
          ) {
            setIsConnected(false);
            setWalletPublicKey(null);
            return;
          }
          throw error;
        }
      }

      const publicKey = provider.publicKey?.toString();
      if (!publicKey) {
        setError("Can't get wallet address. Please reconnect.");
        setIsConnected(false);
        setWalletPublicKey(null);
        return;
      }

      await handleWalletConnection(publicKey);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "phantom_not_installed") {
          setError(getPhantomNotInstalledError());
          return;
        }
        if (!error.message.includes("User rejected the request")) {
          handlePhantomError(error);
        }
      }
    } finally {
      console.error = originalConsoleError;
    }
  }

  /**
   * disconnectWallet disconnects from the wallet and clears the local state and cache.
   */
  const disconnectWallet = useCallback(async () => {
    if (window.phantom?.solana) {
      try {
        await window.phantom.solana.disconnect();
      } catch (error) {
        console.error("Error disconnecting:", error);
      }
    }
    localStorage.removeItem("cachedWallet");
    setWalletPublicKey(null);
    setIsConnected(false);
    setSolBalance(0);
  }, []);

  /**
   * checkCachedWallet checks if there is a cached address in localStorage and
   * if it is valid (not older than 5 days). If the data is outdated – deletes it.
   */
  const checkCachedWallet = useCallback(async () => {
    const cachedString = localStorage.getItem("cachedWallet");
    if (!cachedString) return false;
    let cachedData: CachedWallet;
    try {
      cachedData = JSON.parse(cachedString);
    } catch (error) {
      localStorage.removeItem("cachedWallet");
      console.error("Error checking cached wallet:", error);
      return false;
    }
    const FIVE_DAYS = 5 * 24 * 60 * 60 * 1000;
    if (Date.now() - cachedData.timestamp > FIVE_DAYS) {
      // If more than 5 days have passed since the last use, delete the cache
      localStorage.removeItem("cachedWallet");
      return false;
    }
    try {
      const user = await getCurrentUser(cachedData.publicKey);
      return !!user?.cryptowallet;
    } catch (error) {
      localStorage.removeItem("cachedWallet");
      console.error("Error checking cached wallet:", error);
      return false;
    }
  }, []);

  /**
   * When mounting, we check if there is a cached wallet, and if the extension
   * is installed and connected – automatically restores the state.
   * If there is no data or it is outdated, you will need to initiate connection.
   */
  useEffect(() => {
    const init = async () => {
      const hasCachedWallet = await checkCachedWallet();
      if (hasCachedWallet && window.phantom?.solana?.isConnected) {
        const publicKey = window.phantom.solana.publicKey?.toString();
        if (publicKey) {
          try {
            // Automatically restores the connection
            await handleWalletConnection(publicKey);
            return; // Important: stops execution after successful connection
          } catch (error) {
            console.error("Error auto-connecting:", error);
          }
        }
      }
      // If auto-connection fails, show the authorization modal
      setIsConnected(false);
    };
    init();
  }, [checkCachedWallet, handleWalletConnection]);

  /**
   * Listen for wallet connection/disconnection events (through window.solana).
   */
  useEffect(() => {
    if (window.solana?.isPhantom) {
      const handleConnect = (publicKey: PublicKey) => {
        const keyStr = publicKey.toString();
        setWalletPublicKey(keyStr);
        setIsConnected(true);
        fetchBalance(keyStr);
      };

      const handleDisconnect = () => {
        setWalletPublicKey(null);
        setIsConnected(false);
        setSolBalance(0);
      };

      window.solana.on("connect", handleConnect);
      window.solana.on("disconnect", handleDisconnect);

      return () => {
        window.solana?.off("connect", handleConnect);
        window.solana?.off("disconnect", handleDisconnect);
      };
    }
  }, [fetchBalance]);

  const getExplorerUrl = (address: string): string => {
    return `${SOLANA_MAINNET.blockExplorerUrls?.[0]}/address/${address}`;
  };

  return {
    solBalance,
    isConnected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    checkCachedWallet,
    getExplorerUrl,
    currentRpcUrl: rpcUrls[currentRpcIndex],
  };
}
