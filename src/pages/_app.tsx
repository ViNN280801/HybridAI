// HybridAI/src/pages/_app.tsx

import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PrivyProvider, usePrivy } from "@privy-io/react-auth";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/theme";
import Button from "@/components/ui/button";
import { SOLANA_MAINNET } from "@/config/chains";

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 mins
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

export const WalletButton = () => {
  const { user, login, logout, ready } = usePrivy();

  const handleWalletConnection = async () => {
    if (!ready) {
      console.error("Privy is not ready");
      return;
    }
    try {
      // If wallet is connected, we log out, otherwise use the wallet method to login
      if (user && user.wallet) {
        await logout();
      } else {
        await (
          login as unknown as (options: { method: string }) => Promise<void>
        )({ method: "wallet" });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleWalletConnection}
      disabled={!ready}
    >
      {user?.wallet?.address
        ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}`
        : "Connect Wallet"}
    </Button>
  );
};

export default function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <ThemeProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
        config={{
          loginMethods: ["email", "wallet", "google", "twitter"],
          appearance: {
            theme: "dark",
            accentColor: "#6366f1",
            walletList: ["phantom"],
          },
          embeddedWallets: {
            createOnLogin: "users-without-wallets",
          },
          supportedChains: [
            {
              id: SOLANA_MAINNET.id,
              name: SOLANA_MAINNET.name,
              rpcUrls: {
                default: { http: [SOLANA_MAINNET.rpcUrls.default] },
                privyWalletOverride: { http: [SOLANA_MAINNET.rpcUrls.default] },
              },
              nativeCurrency: SOLANA_MAINNET.nativeCurrency,
            },
          ],
          defaultChain: {
            ...SOLANA_MAINNET,
            rpcUrls: {
              default: { http: [SOLANA_MAINNET.rpcUrls.default] },
              privyWalletOverride: { http: [SOLANA_MAINNET.rpcUrls.default] },
            },
            nativeCurrency: SOLANA_MAINNET.nativeCurrency,
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>
            <Component {...pageProps} />
          </ErrorBoundary>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </PrivyProvider>
    </ThemeProvider>
  );
}
