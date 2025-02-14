// HybridAI/src/services/firebaseController.ts

import {
  doc,
  collection,
  runTransaction,
  arrayUnion,
  arrayRemove,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * User interface representing the user document structure.
 */
export interface User {
  id: string;
  cryptowallet: string;
  emails: string[];
  googleAcc?: string;
  xAcc?: string;
  chatIds: string[];
}

/**
 * Chat interface representing the chat document structure.
 */
export interface Chat {
  id: string;
  name: string;
  content: string;
  owner: string;
}

/**
 * Creates or updates a user document.
 * If the document does not exist, it will be created.
 *
 * @param user - User data to be created or updated.
 */
export async function createOrUpdateUser(user: User): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", user.id);
      const userSnap = await transaction.get(userRef);

      if (userSnap.exists()) {
        // Update existing user document using atomic update for arrays if needed
        transaction.update(userRef, {
          emails: arrayUnion(...user.emails),
        });
      } else {
        // Create new user document with all required fields
        transaction.set(userRef, user);
      }
    });
  } catch (error) {
    throw new Error(
      `Failed to create or update user: ${(error as Error).message}`
    );
  }
}

/**
 * Creates a new chat for the given user.
 * The new chat is assigned the default name "New Chat" and linked to the user.
 *
 * @param userId - The unique identifier of the user.
 * @returns Promise resolving to the created Chat object.
 */
export async function createNewChat(userId: string): Promise<Chat> {
  try {
    let newChat: Chat = {
      id: "",
      name: "New Chat",
      content: "",
      owner: userId,
    };

    await runTransaction(db, async (transaction) => {
      // Reference to the user's document
      const userRef = doc(db, "users", userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("User does not exist.");
      }

      // Create new chat document reference with auto-generated ID
      const chatRef = doc(collection(db, "Chats"));
      // Set chat document with default values and owner field
      transaction.set(chatRef, {
        name: "New Chat",
        content: "",
        createdAt: new Date().toISOString(),
        owner: userId,
      });

      // Atomically update the user's chatIds using arrayUnion
      transaction.update(userRef, { chatIds: arrayUnion(chatRef.id) });
      newChat = {
        id: chatRef.id,
        name: "New Chat",
        content: "",
        owner: userId,
      };
    });

    return newChat;
  } catch (error) {
    throw new Error(`Failed to create new chat: ${(error as Error).message}`);
  }
}

/**
 * Renames an existing chat.
 *
 * @param chatId - The unique identifier of the chat to rename.
 * @param newName - The new name for the chat.
 */
export async function renameChat(
  chatId: string,
  newName: string
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const chatRef = doc(db, "Chats", chatId);
      const chatSnap = await transaction.get(chatRef);
      if (!chatSnap.exists()) {
        throw new Error("Chat does not exist.");
      }
      transaction.update(chatRef, { name: newName });
    });
  } catch (error) {
    throw new Error(`Failed to rename chat: ${(error as Error).message}`);
  }
}

/**
 * Deletes a chat and removes its reference from the user's document.
 *
 * @param userId - The unique identifier of the user.
 * @param chatId - The unique identifier of the chat to delete.
 */
export async function deleteChat(
  userId: string,
  chatId: string
): Promise<void> {
  try {
    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", userId);
      const chatRef = doc(db, "Chats", chatId);

      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) {
        throw new Error("User does not exist.");
      }

      // Delete chat document
      transaction.delete(chatRef);
      // Atomically remove the chatId from the user's chatIds array
      transaction.update(userRef, { chatIds: arrayRemove(chatId) });
    });
  } catch (error) {
    throw new Error(`Failed to delete chat: ${(error as Error).message}`);
  }
}

/**
 * Retrieves all chats associated with the given user.
 *
 * @param userId - The unique identifier of the user.
 * @returns Promise resolving to an array of Chat objects.
 */
export async function getChats(userId: string): Promise<Chat[]> {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("User document does not exist.");
    }

    const userData = userSnap.data() as { chatIds?: string[] };
    const chatIds = userData.chatIds || [];
    const chats: Chat[] = [];

    // For each chatId, fetch the chat document
    for (const id of chatIds) {
      const chatRef = doc(db, "Chats", id);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        chats.push({ id, ...(chatSnap.data() as Omit<Chat, "id">) });
      }
    }
    return chats;
  } catch (error) {
    throw new Error(`Failed to retrieve chats: ${(error as Error).message}`);
  }
}

export async function getCurrentUser(
  walletAddress: string
): Promise<User | null> {
  try {
    const userRef = doc(db, "users", walletAddress);
    const userSnap = await getDoc(userRef);
    return userSnap.exists()
      ? ({ id: userSnap.id, ...userSnap.data() } as User)
      : null;
  } catch (error) {
    throw new Error(`Failed to get user: ${(error as Error).message}`);
  }
}

export async function checkWalletConnection(
  walletAddress: string
): Promise<boolean> {
  try {
    const user = await getCurrentUser(walletAddress);
    return !!user?.cryptowallet;
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return false;
  }
}
