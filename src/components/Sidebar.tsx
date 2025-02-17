// HybridAI/src/components/Sidebar.tsx

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import ComingSoon from "@/components/Modals/ComingSoon";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type SidebarProps = {
  isCollapsed: boolean;
};

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [showComingSoon, setShowComingSoon] = useState(false);

  useEffect(() => {
    setShowComingSoon(false);
  }, [pathname]);

  return (
    <div
      className={`sidebar ${isCollapsed ? "collapsed" : ""}`}
      id="sidebar"
      data-theme={theme}
    >
      <div className="sidebar-header">
        <Link href="/" className="logo-container">
          <Image
            src={
              theme === "dark"
                ? "/hybridai_logo_white.webp"
                : "/hybridai_logo_black.svg"
            }
            alt="HybridAI Logo"
            width={48}
            height={48}
            key={theme}
          />
          <span className="logo-text">Hybrid.AI</span>
        </Link>
      </div>

      <div className="sidebar-menu">
        <Link href="#" className="menu-item" id="chatsMenuItem">
          <span className="material-symbols-rounded">chat</span>
          <span className="menu-text">Chats</span>
          {!isCollapsed && (
            <span className="new-chat material-symbols-rounded">add</span>
          )}
        </Link>

        <Link href="wallet" className="menu-item">
          <span className="material-symbols-rounded">wallet</span>
          <span className="menu-text">Wallet</span>
        </Link>

        <Link
          href="/"
          className={`menu-item ${showComingSoon ? "active" : ""}`}
          onClick={() => setShowComingSoon(true)}
        >
          <span className="material-symbols-rounded">science</span>
          <span className="menu-text">NFT Lab</span>
          {!isCollapsed && <span className="coming-soon-badge">Soon</span>}
        </Link>

        <Link
          href="/"
          className={`menu-item ${showComingSoon ? "active" : ""}`}
          onClick={() => setShowComingSoon(true)}
        >
          <span className="material-symbols-rounded">savings</span>
          <span className="menu-text">Staking</span>
          {!isCollapsed && <span className="coming-soon-badge">Soon</span>}
        </Link>
      </div>
      <div className="sidebar-footer">
        <div className="social-links">
          <Link
            href="https://x.com/thehybridai?s=21"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/x_logo.svg"
              width={48}
              height={48}
              alt="X"
              className="social-icon"
            />
            <span className="social-text">Follow Us</span>
          </Link>
          <Link
            href="https://discord.gg/JKmqwv2W"
            className="social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              src="/discord_logo.svg"
              width={48}
              height={48}
              alt="X"
              className="social-icon"
            />
            <span className="social-text">Join Discord</span>
          </Link>
        </div>
      </div>

      {showComingSoon && (
        <ComingSoon onClose={() => setShowComingSoon(false)} />
      )}
    </div>
  );
}
