// HybridAI/src/lib/phantomHelpers.ts

import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { getCurrentUser } from "@/services/userService";

// Constants
const MAX_RETRY_ATTEMPTS = 3;
const CACHE_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000; // 1 day

export const PHANTOM_DOWNLOAD_LINKS: Record<string, string> = {
  chrome:
    "https://chrome.google.com/webstore/detail/phantom/bfnaelmomeimhlpmgjnjophhpkkoljpa",
  firefox: "https://addons.mozilla.org/firefox/addon/phantom-app/",
  safari: "https://apps.apple.com/app/phantom-solana-wallet/1598432977",
  other: "https://phantom.app/download",
};

/**
 * Determines the user's browser type for providing the correct Phantom download link.
 * @returns Browser key compatible with PHANTOM_DOWNLOAD_LINKS
 */
export const getBrowser = (): keyof typeof PHANTOM_DOWNLOAD_LINKS => {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Safari")) return "safari";
  return "other";
};

/**
 * Fetches the SOL balance for a given public key with retry logic on RPC failure.
 * @param connection Solana Connection instance
 * @param publicKey Wallet public key as string
 * @param setSolBalance Callback to update balance state
 * @param setError Callback to set error state
 * @param switchToNextRpc Function to switch RPC if needed
 * @param retryCount Current retry attempt (default: 0)
 */
export const fetchBalance = async (
  connection: Connection,
  publicKey: string,
  setSolBalance: (balance: number) => void,
  setError: (error: string | null) => void,
  switchToNextRpc: () => string,
  retryCount = 0
): Promise<void> => {
  try {
    const publicKeyInstance = new PublicKey(publicKey);
    const balance = await connection.getBalance(publicKeyInstance);
    setSolBalance(balance / LAMPORTS_PER_SOL);
    setError(null);
  } catch (error) {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      const nextRpc = switchToNextRpc();
      console.warn(`RPC failed. Switching to: ${nextRpc}`);
      return fetchBalance(
        connection,
        publicKey,
        setSolBalance,
        setError,
        switchToNextRpc,
        retryCount + 1
      );
    }
    setError("Connection error. Please try later.");
    console.error("Balance fetch failed:", error);
  }
};

/**
 * Validates the wallet state by checking if the user exists in the system.
 * @param publicKey Wallet public key as string
 * @param handleConnectionError Callback to handle errors
 * @returns Boolean indicating if the wallet is valid
 */
export const validateWalletState = async (
  publicKey: string,
  handleConnectionError: (error: unknown, context: string) => void
): Promise<boolean> => {
  try {
    const user = await getCurrentUser(publicKey);
    return !!user;
  } catch (error) {
    handleConnectionError(error, "Wallet validation");
    return false;
  }
};

/**
 * Persists wallet state in localStorage and sets a timeout for auto-disconnection.
 * @param publicKey Wallet public key as string
 * @param setWalletPublicKey Callback to set public key state
 * @param setIsConnected Callback to set connection state
 * @param disconnectWallet Callback to disconnect the wallet
 * @returns Cleanup function to clear timeout
 */
export const persistWalletState = (
  publicKey: string,
  setWalletPublicKey: (key: string | null) => void,
  setIsConnected: (connected: boolean) => void,
  disconnectWallet: () => Promise<void>
) => {
  const cachedData = { publicKey, timestamp: Date.now() };
  localStorage.setItem("cachedWallet", JSON.stringify(cachedData));
  setWalletPublicKey(publicKey);
  setIsConnected(true);

  const timeoutId = setTimeout(() => {
    disconnectWallet();
    localStorage.removeItem("cachedWallet");
    console.log("Session expired after 1 day");
  }, CACHE_EXPIRATION_MS);

  return () => clearTimeout(timeoutId);
};

/**
 * Disconnects the Phantom wallet and clears local state.
 * @param phantomAdapter PhantomWalletAdapter instance
 * @param setWalletPublicKey Callback to clear public key state
 * @param setIsConnected Callback to clear connection state
 * @param setSolBalance Callback to clear balance state
 */
export const disconnectWalletHelper = async (
  phantomAdapter: PhantomWalletAdapter,
  setWalletPublicKey: (key: string | null) => void,
  setIsConnected: (connected: boolean) => void,
  setSolBalance: (balance: number) => void
) => {
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
};

/**
 * Checks if a cached wallet exists and is still valid.
 * @returns Boolean indicating if a valid cached wallet exists
 */
export const checkCachedWallet = async (): Promise<boolean> => {
  const cachedString = localStorage.getItem("cachedWallet");
  if (!cachedString) return false;

  let cachedData: { publicKey: string; timestamp: number };
  try {
    cachedData = JSON.parse(cachedString);
  } catch (error) {
    localStorage.removeItem("cachedWallet");
    console.error("Error parsing cached wallet:", error);
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
    console.error("Error validating cached wallet:", error);
    return false;
  }
};

/**
 * Handles errors by logging and setting an error message.
 * @param error The error object or unknown
 * @param context Context of the error
 * @param setError Callback to set error state
 */
export const handleConnectionError = (
  error: unknown,
  context: string,
  setError: (error: string | null) => void
) => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  console.error(`${context} error:`, error);
  setError(`${context} error: ${errorMessage}`);
};
