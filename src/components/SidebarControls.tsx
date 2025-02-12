// HybridAI/src/components/SidebarControls.tsx

import AISelector from "@/components/AISelector";

type SidebarControlsProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export default function SidebarControls({
  isCollapsed,
  onToggle,
}: SidebarControlsProps) {
  return (
    <div className="sidebar-controls">
      <button
        className="collapse-btn"
        onClick={onToggle}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <span className="material-symbols-rounded">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>
      <AISelector />
    </div>
  );
}
