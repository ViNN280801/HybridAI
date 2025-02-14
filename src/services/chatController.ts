// HybridAI/src/services/chatController.ts

import {
  getFirestore,
  doc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { firebaseApp } from "@/lib/firebase";

const db = getFirestore(firebaseApp);

/**
 * Chat interface representing the structure of a chat document.
 */
export interface Chat {
  id: string;
  name: string;
  content?: string;
}

/**
 * Creates a new chat for the given user.
 * Initially, the chat is named "New Chat".
 * The name can be updated later based on the conversation context.
 *
 * @param userId - The unique identifier of the user.
 * @returns Promise resolving to the created Chat object.
 */
export async function createNewChat(userId: string): Promise<Chat> {
  try {
    // Create a new chat document in the "Chats" collection
    const chatDocRef = await addDoc(collection(db, "Chats"), {
      name: "New Chat",
      content: "",
      createdAt: new Date().toISOString(),
    });

    // Update the user's document to include the new chat ID in the chatIds array.
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      chatIds: arrayUnion(chatDocRef.id),
    });

    return { id: chatDocRef.id, name: "New Chat" };
  } catch (error) {
    throw new Error(`Failed to create new chat: ${(error as Error).message}`);
  }
}

/**
 * Deletes a chat for the given user.
 *
 * @param userId - The unique identifier of the user.
 * @param chatId - The unique identifier of the chat to delete.
 */
export async function deleteChat(
  userId: string,
  chatId: string
): Promise<void> {
  try {
    // Delete the chat document from the "Chats" collection.
    await deleteDoc(doc(db, "Chats", chatId));

    // Remove the chatId from the user's chatIds array.
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
      chatIds: arrayRemove(chatId),
    });
  } catch (error) {
    throw new Error(
      `Failed to delete chat with id ${chatId}: ${(error as Error).message}`
    );
  }
}

/**
 * Renames an existing chat.
 *
 * @param userId - The unique identifier of the user.
 * @param chatId - The unique identifier of the chat to rename.
 * @param newName - The new name for the chat.
 */
export async function renameChat(
  userId: string,
  chatId: string,
  newName: string
): Promise<void> {
  try {
    // Update the chat document with the new name.
    await updateDoc(doc(db, "Chats", chatId), { name: newName });
  } catch (error) {
    throw new Error(
      `Failed to rename chat with id ${chatId}: ${(error as Error).message}`
    );
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
    const userDocRef = doc(db, "users", userId);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) {
      throw new Error("User document does not exist.");
    }

    const userData = userSnapshot.data();
    const chatIds: string[] = userData.chatIds || [];

    const chats: Chat[] = [];
    // Fetch each chat document based on stored chatIds
    for (const id of chatIds) {
      const chatDoc = await getDoc(doc(db, "Chats", id));
      if (chatDoc.exists()) {
        chats.push({
          id,
          ...(chatDoc.data() as { name: string; content?: string }),
        });
      }
    }
    return chats;
  } catch (error) {
    throw new Error(
      `Failed to fetch chats for user ${userId}: ${(error as Error).message}`
    );
  }
}
