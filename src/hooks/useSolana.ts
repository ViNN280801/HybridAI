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

  const [solBalance, setSolBalance] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);

  // Connection to Solana RPC
  const rpcUrl =
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
    "https://solana-mainnet.rpcpool.com";
  const connection = useMemo(
    () =>
      new Connection(rpcUrl, {
        commitment: "confirmed",
        disableRetryOnRateLimit: false,
        confirmTransactionInitialTimeout: 60000,
      }),
    [rpcUrl]
  );

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

  /**
   * fetchBalance gets the SOL balance for the specified address and updates the state.
   */
  const fetchBalance = useCallback(
    async (publicKey: string) => {
      try {
        const balance = await connection.getBalance(new PublicKey(publicKey));
        setSolBalance(balance / 1_000_000_000);
        setError(null);
      } catch (error) {
        setError(`Can't get balance. Check RPC endpoint: ${rpcUrl}`);
        console.error("Error getting balance:", error);
      }
    },
    [connection, rpcUrl, setError]
  );

  /**
   * handleWalletConnection updates the data in Firebase, sets the state
   * and caches the wallet address with a timestamp in localStorage.
   */
  const handleWalletConnection = useCallback(
    async (publicKey: string) => {
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
        setWalletPublicKey(null);
        setIsConnected(false);
        throw error;
      }
    },
    [fetchBalance]
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
            await handleWalletConnection(publicKey);
          } catch (error) {
            console.error("Error auto-connecting:", error);
          }
        } else {
          console.error("Public key is missing");
        }
      }
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

  return {
    solBalance,
    isConnected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
    fetchBalance,
    checkCachedWallet,
  };
}
