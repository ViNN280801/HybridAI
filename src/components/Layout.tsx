// HybridAI/src/components/Layout.tsx

import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div id="root">
      <Sidebar />
      <main className="chat-container">{children}</main>
    </div>
  );
};

export default Layout;
