// HybridAI/src/components/Layout.tsx

import React from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black p-6">
        <div className="max-w-5xl mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
