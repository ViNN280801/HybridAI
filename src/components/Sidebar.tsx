// HybridAI/src/components/Sidebar.tsx

import Link from "next/link";

type SidebarProps = {
  isCollapsed: boolean;
};

export default function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`} id="sidebar">
      <div className="sidebar-header">
        <Link href="/" className="logo-container">
          <span className="logo-text">Hybrid.Ai</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        <a href="#" className="menu-item active" id="chatsMenuItem">
          <span className="material-symbols-rounded">chat</span>
          <span className="menu-text">Chats</span>
          <span className="new-chat material-symbols-rounded">add</span>
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
          <a href="#" className="social-link">
            <span className="material-symbols-rounded">flutter_dash</span>
            <span className="social-text">Follow Us</span>
          </a>
          <a href="#" className="social-link">
            <span className="material-symbols-rounded">forum</span>
            <span className="social-text">Join Discord</span>
          </a>
        </div>
      </div>
    </div>
  );
}
