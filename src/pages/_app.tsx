// HybridAI/src/pages/_app.tsx

import type { AppProps } from "next/app";
import { usePrivy } from "@privy-io/react-auth";
import "@/styles/globals.css";
import { useEffect, useState } from "react";
import { ThemeProvider } from "@/context/theme";
import Button from "@/components/ui/button";
import Head from "next/head";
import Link from "next/link";

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
    <>
      <Head>
        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </Head>
      <ThemeProvider>
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  );
}
