// HybridAI/src/components/Sidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Settings,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { IconButton, Menu, MenuItem } from "@mui/material";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { WalletButton } from "./WalletButton";
import { useState } from "react";
import RenameChatModal from "@/components/RenameChatModal";
import { useTheme } from "@/context/theme";

const Sidebar = () => {
  const pathname = usePathname();
  const {
    chats,
    createChat,
    activeChat,
    setActiveChat,
    deleteChat,
    renameChat,
  } = useStore();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
  const open = Boolean(anchorEl);

  const { theme, toggleTheme } = useTheme();

  const handleMenuClick = (
    event: React.MouseEvent<HTMLElement>,
    chatId: string
  ) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedChat(chatId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedChat(null);
  };

  const handleRename = () => {
    handleMenuClose();
    setIsRenameModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedChat) {
      deleteChat(selectedChat);
    }
    handleMenuClose();
  };

  const handleRenameSubmit = (newName: string) => {
    if (selectedChat) {
      renameChat(selectedChat, newName);
    }
    setIsRenameModalOpen(false);
  };

  return (
    <div className="w-72 h-screen flex flex-col bg-background-secondary text-foreground shadow-lg">
      <div className="p-6 border-b border-white/20 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold">HybridAI</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={createChat}
          className="bg-white/20 hover:bg-white/30"
        >
          <Plus className="mr-2 h-4 w-4" />
          New chat
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors",
                activeChat === chat.id ? "bg-white/20" : "hover:bg-white/10"
              )}
              onClick={() => setActiveChat(chat.id)}
            >
              <div className="flex items-center gap-2 flex-1">
                <MessageSquare className="h-5 w-5" />
                <span className="text-sm font-medium truncate">
                  {chat.name}
                </span>
              </div>
              <IconButton
                onClick={(e) => handleMenuClick(e, chat.id)}
                size="small"
                className="!ml-2 hover:bg-white/10"
              >
                <MoreHorizontal className="h-4 w-4" />
              </IconButton>
            </div>
          ))}
        </div>
      </div>
      <div className="p-6 border-t border-white/20">
        <WalletButton />
        <Link
          href="/account"
          className="flex items-center gap-2 mt-4 px-3 py-2 rounded hover:bg-white/10"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="flex items-center gap-2"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          <span>{theme === "dark"}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 flex items-center gap-2 justify-start text-red-200 hover:text-red-300"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log Out
        </Button>
      </div>

      <Menu
        id="chat-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        MenuListProps={{
          "aria-labelledby": "chat-menu-button",
        }}
      >
        <MenuItem onClick={handleRename}>Rename</MenuItem>
        <MenuItem onClick={handleDelete}>Remove</MenuItem>
      </Menu>

      {selectedChat && (
        <RenameChatModal
          open={isRenameModalOpen}
          onClose={() => setIsRenameModalOpen(false)}
          onSubmit={handleRenameSubmit}
          currentName={
            chats.find((chat) => chat.id === selectedChat)?.name || ""
          }
        />
      )}
    </div>
  );
};

export default Sidebar;
