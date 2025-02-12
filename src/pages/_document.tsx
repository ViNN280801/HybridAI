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
          href="/missing_texture.png"
          type="image/png"
          sizes="48x48"
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
