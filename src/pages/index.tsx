// HybridAI/src/pages/index.tsx

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CentralWidget from "@/components/CentralWidget";

export default function HomePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <>
      <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar} />
      <CentralWidget />
    </>
  );
}
