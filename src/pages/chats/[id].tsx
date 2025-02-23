// HybridAI/src/pages/chats/[id].tsx

import React, { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CentralWidget from "@/components/CentralWidget";
import { useRouter } from "next/router";
import useStore from "@/lib/store";

type ChatPageProps = {
  initialChat: Chat | null;
};

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  ai_model?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  model?: string;
}

export default function ChatPage({ initialChat }: ChatPageProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const router = useRouter();
  const { id } = router.query;
  const { setActiveChat, chats, addMessage } = useStore();

  useEffect(() => {
    if (id && typeof id === "string") {
      const chatExists = chats.some((chat) => chat.id === id);
      if (!chatExists && initialChat) {
        addMessage(id, { role: "user", content: "Chat initialized" });
        setActiveChat(id);
      } else if (chatExists) {
        setActiveChat(id);
      } else {
        router.push("/"); // Redirect if chat not found
      }
    }
  }, [id, setActiveChat, chats, addMessage, initialChat, router]);

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
