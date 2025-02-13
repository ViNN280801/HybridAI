// HybridAI/src/pages/_app.tsx

import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Head from "next/head";
import HomePage from "@/pages/index";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeProvider";

export default function MyApp({ pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Head>
          <title>Hybrid.Ai - Intelligent Platform</title>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
        </Head>
        <HomePage {...pageProps} />
      </ErrorBoundary>
    </ThemeProvider>
  );
}
