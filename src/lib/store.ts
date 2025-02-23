// HybridAI/lib/store.ts

import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";

const CACHE_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;

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

interface WalletState {
  isConnected: boolean;
  walletPublicKey: string | null;
  solBalance: number;
  walletTimestamp: number | null;
}

type PersistedState = {
  chats: Chat[];
  activeChat: string | null;
  selectedModel: string;
  isConnected: boolean;
  walletPublicKey: string | null;
  solBalance: number;
  walletTimestamp: number | null;
};

interface StoreState extends WalletState {
  chats: Chat[];
  activeChat: string | null;
  selectedModel: string;
  error: string | null;
  createChat: () => void;
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => void;
  renameChat: (id: string, newName: string) => void;
  addMessage: (
    chatId: string,
    message: Omit<Message, "id" | "createdAt">
  ) => void;
  setSelectedModel: (model: string) => void;
  setError: (error: string | null) => void;
  setWalletConnected: (publicKey: string, balance: number) => void;
  disconnectWallet: () => void;
  updateSolBalance: (balance: number) => void;
}

const walletStorage: PersistStorage<PersistedState> = {
  getItem: (name): StorageValue<PersistedState> | null => {
    const value = localStorage.getItem(name);
    if (!value) return null;
    const parsed: StorageValue<PersistedState> = JSON.parse(value);
    const now = Date.now();
    if (
      parsed.state.walletTimestamp &&
      now - parsed.state.walletTimestamp > CACHE_EXPIRATION_MS
    ) {
      localStorage.removeItem(name);
      return null;
    }
    return parsed;
  },
  setItem: (name, value) => {
    localStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name) => localStorage.removeItem(name),
};

const store = create<StoreState>()(
  persist(
    (set) => ({
      chats: [],
      activeChat: null,
      selectedModel: "openai",
      error: null,

      isConnected: false,
      walletPublicKey: null,
      solBalance: 0,
      walletTimestamp: null,

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
      setError: (error) => set({ error }),

      setWalletConnected: (publicKey: string, balance: number) =>
        set({
          isConnected: true,
          walletPublicKey: publicKey,
          solBalance: balance,
          walletTimestamp: Date.now(),
        }),
      disconnectWallet: () =>
        set({
          isConnected: false,
          walletPublicKey: null,
          solBalance: 0,
          walletTimestamp: null,
        }),
      updateSolBalance: (balance: number) => set({ solBalance: balance }),
    }),
    {
      name: "hybridai-storage",
      storage: walletStorage,
      partialize: (state) => ({
        chats: state.chats,
        activeChat: state.activeChat,
        selectedModel: state.selectedModel,
        isConnected: state.isConnected,
        walletPublicKey: state.walletPublicKey,
        solBalance: state.solBalance,
        walletTimestamp: state.walletTimestamp,
      }),
    }
  )
);

export default store;
