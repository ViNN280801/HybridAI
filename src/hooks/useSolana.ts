// HybridAI/src/hooks/useSolana.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { Connection, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import useStore from "@/lib/store";
import { SOLANA_MAINNET } from "@/config/chains";
import {
  fetchBalance,
  validateWalletState,
  persistWalletState,
  disconnectWalletHelper,
  checkCachedWallet,
  handleConnectionError,
  PHANTOM_DOWNLOAD_LINKS,
  getBrowser,
} from "@/lib/phantom-helpers";
import { createOrUpdateUser } from "@/services/userService";

declare global {
  interface Window {
    phantom?: { solana?: PhantomWalletAdapter };
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

  // Memoized RPC URLs from config
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

  // Switches to the next RPC endpoint
  const switchToNextRpc = useCallback(() => {
    setCurrentRpcIndex((prev) => (prev + 1) % rpcUrls.length);
    return rpcUrls[(currentRpcIndex + 1) % rpcUrls.length];
  }, [rpcUrls, currentRpcIndex]);

  // Solana connection instance
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

  // Disconnects the wallet
  const disconnectWallet = useCallback(async () => {
    await disconnectWalletHelper(
      phantomAdapter,
      setWalletPublicKey,
      setIsConnected,
      setSolBalance
    );
  }, [phantomAdapter]);

  // Handles wallet connection with retry logic
  const handleWalletConnection = useCallback(
    async (publicKey: string, retryCount = 0): Promise<void> => {
      const MAX_RETRIES = rpcUrls.length;

      try {
        if (
          !(await validateWalletState(publicKey, (error, context) =>
            handleConnectionError(error, context, setError)
          ))
        )
          return;

        await createOrUpdateUser(publicKey);
        await fetchBalance(
          connection,
          publicKey,
          setSolBalance,
          setError,
          switchToNextRpc
        );
        persistWalletState(
          publicKey,
          setWalletPublicKey,
          setIsConnected,
          disconnectWallet
        );
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
    [connection, rpcUrls.length, switchToNextRpc, disconnectWallet, setError]
  );

  // Connects to Phantom wallet
  const connectWallet = useCallback(async () => {
    try {
      const phantom = window.phantom?.solana;
      if (!phantom) {
        const browser = getBrowser();
        setError(
          `Phantom Wallet extension not detected.\n\n` +
            `Install for ${browser.toUpperCase()}: ${PHANTOM_DOWNLOAD_LINKS[browser]}\n\n` +
            "Refresh the page after installation."
        );
        return;
      }

      if (!phantom.connected) {
        await phantom.connect();
      }

      const publicKey = phantom.publicKey?.toString();
      if (!publicKey) {
        setError(
          "Failed to get public key. Please try again or contact support."
        );
        return;
      }

      await handleWalletConnection(publicKey);
    } catch (error) {
      if (error instanceof Error && error.message.includes("User rejected")) {
        window.location.href = "/";
        return;
      }
      setError(
        `Wallet connection failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
      setWalletPublicKey(null);
      setIsConnected(false);
      localStorage.removeItem("cachedWallet");
    }
  }, [setError, handleWalletConnection]);

  // Initializes wallet state on mount
  useEffect(() => {
    const init = async () => {
      const hasCachedWallet = await checkCachedWallet();
      if (hasCachedWallet && window.phantom?.solana?.connected) {
        const publicKey = window.phantom.solana.publicKey?.toString();
        if (publicKey && !isConnected) {
          await fetchBalance(
            connection,
            publicKey,
            setSolBalance,
            setError,
            switchToNextRpc
          );
          setWalletPublicKey(publicKey);
          setIsConnected(true);
        }
      }
    };
    init();
  }, [connection, switchToNextRpc, isConnected, setError]);

  // Listens for wallet events
  useEffect(() => {
    const solana = window.solana;
    if (solana?.isPhantom) {
      const handleConnect = (publicKey: PublicKey) => {
        const keyStr = publicKey.toString();
        setWalletPublicKey(keyStr);
        setIsConnected(true);
        fetchBalance(
          connection,
          keyStr,
          setSolBalance,
          setError,
          switchToNextRpc
        );
      };

      const handleDisconnect = () => {
        setWalletPublicKey(null);
        setIsConnected(false);
        setSolBalance(0);
      };

      solana.on("connect", handleConnect);
      solana.on("disconnect", handleDisconnect);

      return () => {
        solana.off("connect", handleConnect);
        solana.off("disconnect", handleDisconnect);
      };
    }
  }, [connection, switchToNextRpc, setError]);

  const getExplorerUrl = (address: string): string => {
    return `${SOLANA_MAINNET.blockExplorerUrls?.[0]}/address/${address}`;
  };

  return {
    solBalance,
    isConnected,
    walletPublicKey,
    connectWallet,
    disconnectWallet,
    fetchBalance: (publicKey: string) =>
      fetchBalance(
        connection,
        publicKey,
        setSolBalance,
        setError,
        switchToNextRpc
      ),
    checkCachedWallet,
    getExplorerUrl,
    currentRpcUrl,
  };
}
