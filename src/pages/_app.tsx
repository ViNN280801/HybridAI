// HybridAI/src/pages/_app.tsx

import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Head from "next/head";
import HomePage from "@/pages/index";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeProvider";
import { Provider } from "react-redux";
import store from "@/lib/store";

export default function MyApp({ pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <Head>
            <title>Hybrid.Ai - Intelligent Platform</title>
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
          </Head>
          <HomePage {...pageProps} />
        </Provider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
