// HybridAI/src/hooks/useSolana.ts

import { useEffect, useCallback, useMemo, useState } from "react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import useStore from "@/lib/store";
import { SOLANA_MAINNET } from "@/config/chains";
import {
  fetchBalance,
  validateWalletState,
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
  const {
    setError,
    isConnected,
    walletPublicKey,
    solBalance,
    setWalletConnected,
    disconnectWallet: disconnectWalletState,
    updateSolBalance,
  } = useStore();

  const [currentRpcIndex, setCurrentRpcIndex] = useState(0);

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
      () => {},
      () => {},
      () => {}
    );
    disconnectWalletState();
  }, [phantomAdapter, disconnectWalletState]);

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
        const balance = await connection.getBalance(new PublicKey(publicKey));
        setWalletConnected(publicKey, balance / LAMPORTS_PER_SOL);
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
        disconnectWalletState();
        setError(`Connection error: ${error}. Please try later.`);
      }
    },
    [
      connection,
      rpcUrls.length,
      switchToNextRpc,
      setError,
      setWalletConnected,
      disconnectWalletState,
    ]
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
      disconnectWalletState();
    }
  }, [setError, handleWalletConnection, disconnectWalletState]);

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
            updateSolBalance,
            setError,
            switchToNextRpc
          );
          setWalletConnected(publicKey, solBalance);
        }
      }
    };
    init();
  }, [
    connection,
    switchToNextRpc,
    isConnected,
    setError,
    setWalletConnected,
    solBalance,
    updateSolBalance,
  ]);

  // Listens for wallet events
  useEffect(() => {
    const solana = window.solana;
    if (solana?.isPhantom) {
      const handleConnect = (publicKey: PublicKey) => {
        const keyStr = publicKey.toString();
        fetchBalance(
          connection,
          keyStr,
          updateSolBalance,
          setError,
          switchToNextRpc
        ).then(() => setWalletConnected(keyStr, solBalance));
      };

      const handleDisconnect = () => {
        disconnectWalletState();
      };

      solana.on("connect", handleConnect);
      solana.on("disconnect", handleDisconnect);

      return () => {
        solana.off("connect", handleConnect);
        solana.off("disconnect", handleDisconnect);
      };
    }
  }, [
    connection,
    switchToNextRpc,
    setError,
    setWalletConnected,
    disconnectWalletState,
    solBalance,
    updateSolBalance,
  ]);

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
        updateSolBalance,
        setError,
        switchToNextRpc
      ),
    checkCachedWallet,
    getExplorerUrl,
    currentRpcUrl,
  };
}
