// HybridAI/src/pages/index.tsx

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import CentralWidget from "@/components/CentralWidget";

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
