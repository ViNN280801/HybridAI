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
        {/* Default favicon is white without any background and borders */}
        <link
          id="favicon"
          rel="icon"
          href="/favicon_white.ico"
          type="image/x-icon"
        />

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

        {/* Script to handle theme-based favicon */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
                
                function updateFavicon(e) {
                  const favicon = document.getElementById('favicon');
                  if (favicon) {
                    // If dark theme -> light favicon, if light theme -> dark favicon
                    favicon.href = e.matches ? '/favicon_white.ico' : '/favicon_black.ico';
                  }
                }

                // Set initial favicon
                updateFavicon(mediaQuery);
                
                // Update favicon on theme change
                mediaQuery.addListener(updateFavicon);
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
