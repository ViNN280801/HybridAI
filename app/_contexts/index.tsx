"use client";

import { Analytics } from "@vercel/analytics/react";

import { PrivyProvider } from "./privy";
import { ColorModeProvider } from "./color-mode";

interface Props {
  children: React.ReactNode;
}

const Providers: React.FC<Props> = ({ children }) => {
  return (
    <PrivyProvider>
      <ColorModeProvider>
        <Analytics />
        {children}
      </ColorModeProvider>
    </PrivyProvider>
  );
};

export default Providers;

export * from "./color-mode";
