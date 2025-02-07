// HybridAI/src/components/Sidebar.tsx

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Moon, Sun, User, Wallet } from "lucide-react";

const Sidebar: React.FC = () => {
  const [theme, setTheme] = useState("dark");
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  return (
    <div className={`sidebar ${theme}`}>
      <div className="header">
        <Image src="/missing_texture.png" alt="Logo" />
        <span>Hybrid.AI</span>
        <button onClick={toggleTheme}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </button>
      </div>
      <div className="chats-section">
        <h3>Chats</h3>
        <p>No chats yet. Click the + button to create one.</p>
      </div>
      <div className="account-section">
        <Link href="/account" className="account-link">
          <User /> Account
        </Link>
      </div>
      <div className="wallet-section">
        <Link href="/wallet" className="wallet-link">
          <Wallet /> Connect Wallet
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
