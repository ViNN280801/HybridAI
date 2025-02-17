// HybridAI/src/pages/_document.tsx

import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

/**
 * Document component
 *
 * This component is used to render the HTML document for the application.
 * It includes the Head component to include the Material Symbols font.
 * Google Fonts are used to include the Material Symbols font.
 */
export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          rel="icon"
          href="/favicon-light.ico"
          media="(prefers-color-scheme: light)"
          type="image/x-icon"
        />
        <link
          rel="icon"
          href="/favicon-dark.ico"
          media="(prefers-color-scheme: dark)"
          type="image/x-icon"
        />

        <link rel="icon" href="/favicon-dark.ico" type="image/x-icon" />

        <link
          rel="preload"
          href="/hybridai_logo_white.webp"
          as="image"
          type="image/webp"
        />
        <link
          rel="preload"
          href="/hybridai_logo_black.svg"
          as="image"
          type="image/svg+xml"
        />

        <Link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,0,0"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
