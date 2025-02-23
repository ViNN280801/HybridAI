// HybridAI/src/hooks/useSolana.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import useStore from "@/lib/store";
import { createOrUpdateUser, getCurrentUser } from "@/services/userService";
import { SOLANA_MAINNET } from "@/config/chains";

// Interface for data saved in localStorage
interface CachedWallet {
  publicKey: string;
  timestamp: number;
}

// Constants for reuse
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000; // 1 day

const PHANTOM_DOWNLOAD_LINKS: Record<string, string> = {
  chrome:
    "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
  firefox: "https://addons.mozilla.org/firefox/addon/phantom-app/",
  safari: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
  other: "https://phantom.app/download",
};

const getBrowser = (): keyof typeof PHANTOM_DOWNLOAD_LINKS => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Safari")) return "safari";
  return "other";
};

declare global {
  interface Window {
    phantom?: {
      solana?: PhantomWalletAdapter;
    };
    solana?: PhantomWalletAdapter & {
      isPhantom?: boolean;
      on?: <T extends PublicKey | undefined>(
        event: "connect" | "disconnect",
        callback: (publicKey: T) => void
      ) => void;
      off?: <T extends PublicKey | undefined>(
        event: "connect" | "disconnect",
        callback: (publicKey: T) => void
      ) => void;
    };
  }
}

export default function useSolana() {
  const { setError } = useStore();

  const [currentRpcIndex, setCurrentRpcIndex] = useState(0);
  const [solBalance, setSolBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [walletPublicKey, setWalletPublicKey] = useState<string | null>(null);

  // Getting the list of RPC endpoints
  const rpcUrls = useMemo(() => {
    const urls = Object.values(SOLANA_MAINNET.rpcUrls).filter(
      (url) => typeof url === "string" && url.length > 0
    );

    if (urls.length === 0) {
      throw new Error("No valid RPC endpoints found in SOLANA_MAINNET config");
    }

    return urls;
  }, []);

  const safeRpcIndex = currentRpcIndex % rpcUrls.length;
  const currentRpcUrl = rpcUrls[safeRpcIndex];

  /**
   * Switches to the next available RPC endpoint
   * @returns {string} Next RPC URL
   */
  const switchToNextRpc = useCallback(() => {
    setCurrentRpcIndex((prev) => {
      const nextIndex = (prev + 1) % rpcUrls.length;
      return nextIndex;
    });
    return rpcUrls[(currentRpcIndex + 1) % rpcUrls.length];
  }, [rpcUrls, currentRpcIndex]);

  // Connection to Solana RPC
  const connection = useMemo(
    () =>
      new Connection(currentRpcUrl, {
        commitment: "confirmed",
        disableRetryOnRateLimit: false,
        confirmTransactionInitialTimeout: 60000,
      }),
    [currentRpcUrl]
  );

  const phantomAdapter = useMemo(() => new PhantomWalletAdapter(), []);

  /**
   * Updates the wallet balance with automatic reconnection
   * @param {string} publicKey Public key of the wallet
   * @param {number} [retryCount=0] Retry counter
   */
  const fetchBalance = useCallback(
    async (publicKey: string, retryCount = 0) => {
      try {
        const publicKeyInstance = new PublicKey(publicKey);
        const balance = await connection.getBalance(publicKeyInstance);
        setSolBalance(balance / LAMPORTS_PER_SOL);
        setError(null);
      } catch (error) {
        if (retryCount < MAX_RETRY_ATTEMPTS) {
          const nextRpc = switchToNextRpc();
          console.warn(`RPC failed. Switching to: ${nextRpc}`);
          return fetchBalance(publicKey, retryCount + 1);
        }
        setError("Connection error. Please try later.");
        console.error("Balance fetch failed:", error);
      }
    },
    [connection, setError, switchToNextRpc]
  );

  const handleConnectionError = useCallback(
    (error: unknown, context: string) => {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(`${context} error:`, error);
      setError(`${context} error: ${errorMessage}`);
    },
    [setError]
  );

  const validateWalletState = useCallback(
    async (publicKey: string) => {
      try {
        const user = await getCurrentUser(publicKey);
        return !!user;
      } catch (error) {
        handleConnectionError(error, "Wallet validation");
        return false;
      }
    },
    [handleConnectionError]
  );

  /**
   * disconnectWallet disconnects from the wallet and clears the local state and cache.
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await phantomAdapter.disconnect();
      setWalletPublicKey(null);
      setIsConnected(false);
      setSolBalance(0);
      localStorage.removeItem("cachedWallet");

      if (window.solana?.isPhantom) {
        window.solana.emit("disconnect");
      }
    } catch (error) {
      console.error("Disconnection error:", error);
    }
  }, [phantomAdapter]);

  const persistWalletState = useCallback(
    (publicKey: string) => {
      const cachedData: CachedWallet = {
        publicKey,
        timestamp: Date.now(),
      };
      localStorage.setItem("cachedWallet", JSON.stringify(cachedData));
      setWalletPublicKey(publicKey);
      setIsConnected(true);

      // Set timer to automatically disconnect the wallet
      const timeoutId = setTimeout(() => {
        disconnectWallet();
        localStorage.removeItem("cachedWallet");
        console.log("Session expired after 30 seconds");
      }, CACHE_EXPIRATION_MS);

      // Clear the timer double calling or unmounting
      return () => clearTimeout(timeoutId);
    },
    [disconnectWallet]
  );

  // Update handleWalletConnection with reconnection mechanism
  const handleWalletConnection = useCallback(
    async (publicKey: string, retryCount = 0): Promise<void> => {
      const MAX_RETRIES = rpcUrls.length;

      try {
        if (!(await validateWalletState(publicKey))) return;

        await createOrUpdateUser(publicKey);
        await fetchBalance(publicKey);
        persistWalletState(publicKey);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Wallet already registered"
        ) {
          setError("This wallet is already registered");
          return;
        }
        if (retryCount < MAX_RETRIES - 1) {
          const nextRpc = switchToNextRpc();
          console.warn(`Connection failed. Switching to ${nextRpc}`);
          return handleWalletConnection(publicKey, retryCount + 1);
        }

        setWalletPublicKey(null);
        setIsConnected(false);
        setError(`Connection error: ${error}. Please try later.`);
      }
    },
    [
      validateWalletState,
      fetchBalance,
      persistWalletState,
      switchToNextRpc,
      rpcUrls.length,
      setError,
    ]
  );

  /**
   * connectWallet tries to connect to Phantom.
   * If the user rejects the request or Phantom is not installed – outputs an error.
   */
  const connectWallet = useCallback(async () => {
    try {
      const phantom = window.phantom?.solana;
      if (!phantom) {
        const browser = getBrowser();
        useStore
          .getState()
          .setError(
            `Phantom Wallet extension not detected. Required for operation.\n\n` +
              `Install for ${browser.toUpperCase()}: ${PHANTOM_DOWNLOAD_LINKS[browser]}\n\n` +
              "If you already have Phantom installed, please refresh the page."
          );
        return;
      }

      if (!phantom.connected) {
        try {
          await phantom.connect();
        } catch (error) {
          // Check for user rejection
          if (
            error instanceof Error &&
            (error.message.includes("User rejected") ||
              error.message.includes("User rejected the request"))
          ) {
            // Silent handling - just redirect to home
            window.location.href = "/";
            return;
          }
          // Handle other connection errors
          useStore
            .getState()
            .setError(
              `Wallet connection failed: ${error instanceof Error ? error.message : "Unknown error"}\n\n` +
                "Common solutions:\n" +
                "1. Refresh the page\n" +
                "2. Check Phantom extension permissions\n" +
                "3. Update Phantom to latest version"
            );
        }
      }

      const publicKey = phantom.publicKey?.toString();
      if (!publicKey) {
        setError(
          "Failed to get public key. Please try again later or contact support. \n\n" +
            "Or maybe you have not installed Phantom Wallet extension or not set it up properly."
        );
        return;
      }

      let user = await getCurrentUser(publicKey);
      if (!user) {
        user = await createOrUpdateUser(publicKey);
      }

      await fetchBalance(publicKey);
      persistWalletState(publicKey);
    } catch (error) {
      // Handle other errors
      console.error("Wallet connection process error:", error);
      useStore
        .getState()
        .setError(
          `Critical error during wallet connection:\n${
            error instanceof Error ? error.message : "Unknown system error"
          }\n\n` + "Please contact support if this persists or try again later."
        );

      setWalletPublicKey(null);
      setIsConnected(false);
      localStorage.removeItem("cachedWallet");
    }
  }, [setError, fetchBalance, persistWalletState]);

  /**
   * checkCachedWallet checks if there is a cached address in localStorage and
   * if it is valid. If the data is outdated – deletes it.
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
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRATION_MS) {
      localStorage.removeItem("cachedWallet");
      return false;
    }
    try {
      const user = await getCurrentUser(cachedData.publicKey);
      return !!user?.id;
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
      if (hasCachedWallet && window.phantom?.solana?.connected) {
        const publicKey = window.phantom.solana.publicKey?.toString();
        if (publicKey && !isConnected) {
          // Only connect if not already connected
          try {
            await fetchBalance(publicKey);
            setWalletPublicKey(publicKey);
            setIsConnected(true);
            return;
          } catch (error) {
            console.error("Error restoring wallet state:", error);
          }
        }
      }
      // No setIsConnected(false) to preserve state across navigation
    };
    init();
  }, [checkCachedWallet, fetchBalance, isConnected]);

  /**
   * Listen for wallet connection/disconnection events (through window.solana).
   */
  useEffect(() => {
    const solana = window.solana;
    if (solana?.isPhantom) {
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

      solana.on("connect", handleConnect);
      solana.on("disconnect", handleDisconnect);

      return () => {
        solana?.off("connect", handleConnect);
        solana?.off("disconnect", handleDisconnect);
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
    currentRpcUrl,
  };
}
