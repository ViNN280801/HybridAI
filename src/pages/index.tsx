// HybridAI/src/pages/index.tsx

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CentralWidget from "@/components/CentralWidget";

/**
 * HomePage acts as the entry point of the application, combining the sidebar and central widget.
 * It provides a clean layout for users to start interacting with AI models.
 */
export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <>
      <Sidebar isCollapsed={isSidebarCollapsed} />
      <CentralWidget
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
    </>
  );
}
