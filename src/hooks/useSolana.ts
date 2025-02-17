// HybridAI/src/hooks/useSolana.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import useStore from "@/lib/store";
import {
  createOrUpdateUser,
  getCurrentUser,
} from "@/services/firebaseController";
import { SOLANA_MAINNET } from "@/config/chains";
import { initializeFirebase, signInAnonymously } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

// Interface for data saved in localStorage
interface CachedWallet {
  publicKey: string;
  timestamp: number;
}

// Constants for reuse
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_EXPIRATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 days

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

  // Update handleWalletConnection with reconnection mechanism
  const handleWalletConnection = useCallback(
    async (publicKey: string, retryCount = 0): Promise<void> => {
      const MAX_RETRIES = rpcUrls.length;

      try {
        await createOrUpdateUser({
          id: publicKey,
          cryptowallet: publicKey,
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

  const { auth } = useMemo(() => initializeFirebase(), []);

  /**
   * Connects an anonymous account to a wallet
   */
  const linkWalletToAnonymousAccount = useCallback(
    async (publicKey: string) => {
      try {
        const user = auth.currentUser;
        if (!user || !user.isAnonymous) {
          throw new Error("No anonymous session found");
        }

        await updateProfile(user, {
          displayName: publicKey,
          photoURL: `https://api.dicebear.com/7.x/identicon/svg?seed=${publicKey}`,
        });

        await createOrUpdateUser({
          id: user.uid,
          cryptowallet: publicKey,
          chatIds: [],
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? `Wallet linking failed: ${error.message}`
            : "Unknown error during wallet linking";
        throw new Error(errorMessage);
      }
    },
    [auth]
  );

  /**
   * connectWallet tries to connect to Phantom.
   * If the user rejects the request or Phantom is not installed – outputs an error.
   */
  const connectWallet = useCallback(async () => {
    try {
      // Anonymous authentication when first connecting
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      // Connecting the Phantom wallet
      const phantom = window.phantom?.solana;
      if (!phantom) {
        throw new Error("Phantom wallet not detected");
      }

      if (!phantom.connected) {
        await phantom.connect();
      }

      const publicKey = phantom.publicKey?.toString();
      if (!publicKey) {
        throw new Error("Failed to get public key");
      }

      // Bind the wallet to the anonymous account
      await linkWalletToAnonymousAccount(publicKey);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  }, [linkWalletToAnonymousAccount, auth]);

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
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRATION_MS) {
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
      if (hasCachedWallet && window.phantom?.solana?.connected) {
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
