// HybridAI/src/lib/store.ts

import { create } from "zustand";
import { persist, PersistStorage, StorageValue } from "zustand/middleware";
import supabase from "@/lib/supabase";

const CACHE_EXPIRATION_MS = 1 * 24 * 60 * 60 * 1000;

interface Chat {
  id: string;
  name: string;
  messages: Message[];
  createdAt: Date;
  ai_model?: string; // Represents the AI model associated with the chat history
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  model?: string; // Captures the AI model used for generating a specific response
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
  createChat: () => Promise<string>; // Updated to return Promise<string>
  setActiveChat: (id: string) => void;
  deleteChat: (id: string) => Promise<void>;
  renameChat: (id: string, newName: string) => Promise<void>;
  addMessage: (
    chatId: string,
    message: Omit<Message, "id" | "createdAt">
  ) => Promise<void>;
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

/**
 * Manages application state for chats, wallet, and AI interactions, integrating with Supabase for persistence.
 * This store ensures seamless synchronization of chat histories, wallet status, and AI model preferences across the application.
 */
const store = create<StoreState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      selectedModel: "deepseek", // Sets the default AI model for user queries
      error: null,

      isConnected: false,
      walletPublicKey: null,
      solBalance: 0,
      walletTimestamp: null,

      // Initiates the creation of new chat sessions, integrating with Supabase for persistent storage
      createChat: async () => {
        const { walletPublicKey } = get();
        if (!walletPublicKey) throw new Error("User not authenticated");

        const newChat: Chat = {
          id: Date.now().toString(),
          name: "New Chat",
          messages: [],
          createdAt: new Date(),
          ai_model: get().selectedModel,
        };

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("wallet_address", walletPublicKey)
          .single();

        if (userError)
          throw new Error(`User lookup failed: ${userError.message}`);
        if (!user?.id) throw new Error("User not found");

        const { error } = await supabase.from("chats").insert({
          id: newChat.id,
          name: newChat.name,
          user_id: user.id,
          ai_model: newChat.ai_model,
          messages: newChat.messages,
          created_at: newChat.createdAt.toISOString(),
        });

        if (error) throw new Error(`Supabase insert failed: ${error.message}`);
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat.id,
        }));
        return newChat.id; // Return the new chat ID
      },

      // Sets the currently active chat for user interaction
      setActiveChat: (id) => set({ activeChat: id }),

      // Handles the removal of chat sessions, ensuring data consistency with Supabase
      deleteChat: async (id) => {
        const { error } = await supabase.from("chats").delete().eq("id", id);
        if (error) throw new Error(`Supabase delete failed: ${error.message}`);
        set((state) => ({
          chats: state.chats.filter((chat) => chat.id !== id),
          activeChat: state.activeChat === id ? null : state.activeChat,
        }));
      },

      // Updates the name of a specific chat, maintaining synchronization with Supabase
      renameChat: async (id, newName) => {
        const { error } = await supabase
          .from("chats")
          .update({ name: newName })
          .eq("id", id);
        if (error) throw new Error(`Supabase update failed: ${error.message}`);
        set((state) => ({
          chats: state.chats.map((chat) =>
            chat.id === id ? { ...chat, name: newName } : chat
          ),
        }));
      },

      // Manages message additions to chats, auto-renaming based on initial user input and updating AI model usage
      addMessage: async (chatId, message) => {
        const newMessage = {
          ...message,
          id: Date.now().toString(),
          createdAt: new Date(),
          model: get().selectedModel, // Records the AI model for the response
        };
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedMessages = [...chat.messages, newMessage];
              let newName = chat.name;
              if (
                message.role === "user" &&
                chat.messages.length === 0 &&
                chat.name === "New Chat"
              ) {
                newName = message.content.substring(0, 30) + "...";
              }
              (async () => {
                const { error } = await supabase
                  .from("chats")
                  .update({
                    messages: updatedMessages,
                    name: newName,
                    ai_model: get().selectedModel, // Updates the AI model for the chat
                  })
                  .eq("id", chatId)
                  .select(); // Retrieves updated chat data
                if (error)
                  console.error(`Supabase update failed: ${error.message}`);
              })();
              return {
                ...chat,
                messages: updatedMessages,
                name: newName,
                ai_model: get().selectedModel,
              };
            }
            return chat;
          });
          return { chats: updatedChats };
        });
      },

      // Updates the selected AI model across the application for consistent query handling
      setSelectedModel: (model) => set({ selectedModel: model }),
      // Sets error messages for user feedback
      setError: (error) => set({ error }),

      // Updates wallet connection status and balance for Solana integration
      setWalletConnected: (publicKey: string, balance: number) =>
        set({
          isConnected: true,
          walletPublicKey: publicKey,
          solBalance: balance,
          walletTimestamp: Date.now(),
        }),
      // Disconnects the wallet, clearing associated state
      disconnectWallet: () =>
        set({
          isConnected: false,
          walletPublicKey: null,
          solBalance: 0,
          walletTimestamp: null,
        }),
      // Refreshes the Solana balance for the connected wallet
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
