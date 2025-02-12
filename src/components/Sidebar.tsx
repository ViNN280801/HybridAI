// HybridAI/src/components/Sidebar.tsx

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";

type SidebarProps = {
  isCollapsed: boolean;
};

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const { theme } = useTheme();

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      id="sidebar"
      data-theme={theme}
    >
      <div className="sidebar-header">
        <Link href="/" className="logo-container">
          <span className="logo-text">Hybrid.Ai</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        <a href="#" className="menu-item" id="chatsMenuItem">
          <span className="material-symbols-rounded">chat</span>
          <span className="menu-text">Chats</span>
          {!isCollapsed && (
            <span className="new-chat material-symbols-rounded">add</span>
          )}
        </a>

        <a href="#" className="menu-item">
          <span className="material-symbols-rounded">person</span>
          <span className="menu-text">Account</span>
        </a>

        <a href="#" className="menu-item">
          <span className="material-symbols-rounded">wallet</span>
          <span className="menu-text">Wallet</span>
        </a>
      </div>

      <div className="sidebar-footer">
        <div className="social-links">
          <a
            href="https://x.com/thehybridai?s=21"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-rounded">flutter_dash</span>
            <span className="social-text">Follow Us</span>
          </a>
          <a
            href="https://discord.gg/JKmqwv2W"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="material-symbols-rounded">forum</span>
            <span className="social-text">Join Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
}
