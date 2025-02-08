// HybridAI/lib/store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  model?: string;
}

interface StoreState {
  chats: Chat[];
  activeChat: string | null;
  selectedModel: string;
  createChat: () => void;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newName: string) => void;
  addMessage: (
    chatId: string,
    message: Omit<Message, "id" | "createdAt">
  ) => void;
  setSelectedModel: (model: string) => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      chats: [],
      activeChat: null,
      selectedModel: "openai",
      createChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          name: `Chat ${Date.now()}`,
          messages: [],
          createdAt: new Date(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
        }));
      },
      setActiveChat: (id) => set({ activeChat: id }),
      deleteChat: (id) =>
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          activeChat: state.activeChat === id ? null : state.activeChat,
        })),
      renameChat: (id, newName) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, name: newName } : chat
          ),
        })),
      addMessage: (chatId, message) =>
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  messages: [
                    ...chat.messages,
                    {
                      ...message,
                      id: Date.now().toString(),
                      createdAt: new Date(),
                    },
                  ],
                }
              : chat
          ),
        })),
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "chat-storage",
    }
  )
);
