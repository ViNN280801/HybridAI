// HybridAI/src/components/Sidebar.tsx

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import Image from "next/image";
import ComingSoon from "@/components/Modals/ComingSoon";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import useStore from "@/lib/store";

type SidebarProps = {
  isCollapsed: boolean;
};

export default function Sidebar({ isCollapsed }: SidebarProps) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isChatListOpen, setIsChatListOpen] = useState(false);
  const {
    chats,
    activeChat,
    createChat,
    setActiveChat,
    deleteChat,
    renameChat,
  } = useStore();

  useEffect(() => {
    setShowComingSoon(false);
    // Automatically opens the chat list if there are any chats available
    if (chats.length > 0 && !isChatListOpen) {
      setIsChatListOpen(true);
    }
  }, [pathname, chats, isChatListOpen]);
  
  // Controls the visibility of the chat list in the sidebar
  const toggleChatList = () => {
    setIsChatListOpen(!isChatListOpen);
  };

  // Initiates the creation of new chat sessions for user interaction
  const handleCreateChat = async () => {
    try {
      await createChat();
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  };

  // Manages the renaming of existing chat sessions
  const handleRenameChat = (id: string, currentName: string) => {
    const newName = prompt("Enter new chat name:", currentName);
    if (newName) {
      renameChat(id, newName);
    }
  };

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
        <div className="chats-section">
          <Link href="#" className="menu-item" id="chatsMenuItem">
            <span
              className="material-symbols-rounded toggle-chat"
              onClick={toggleChatList}
            >
              {isChatListOpen ? "expand_less" : "expand_more"}
            </span>
            <span className="material-symbols-rounded">chat</span>
            <span className="menu-text">Chats</span>
            {!isCollapsed && (
              <span
                className="new-chat material-symbols-rounded"
                onClick={handleCreateChat}
              >
                add
              </span>
            )}
          </Link>
          {!isCollapsed && isChatListOpen && (
            <div className="chat-list">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`chat-item ${activeChat === chat.id ? "active" : ""}`}
                >
                  <Link
                    href={`/chats/${chat.id}`}
                    className="menu-text-child"
                    onClick={() => setActiveChat(chat.id)}
                  >
                    {chat.name}
                  </Link>
                  <span
                    className="chat-action material-symbols-rounded"
                    onClick={() => handleRenameChat(chat.id, chat.name)}
                  >
                    edit
                  </span>
                  <span
                    className="chat-action material-symbols-rounded"
                    onClick={() => deleteChat(chat.id)}
                  >
                    delete
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Link href="/wallet" className="menu-item">
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
              alt="Discord"
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
