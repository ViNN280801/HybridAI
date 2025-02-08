// src/components/ChatHistory.tsx

"use client";

import { useEffect, useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  name: string;
  messages: Message[];
}

const ChatHistory = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");

  const fetchChats = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "chats"));
      const chatsData: Chat[] = [];
      querySnapshot.forEach((doc) => {
        chatsData.push({ id: doc.id, ...doc.data() } as Chat);
      });
      setChats(chatsData);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chats", id));
      fetchChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  };

  const handleEdit = (chat: Chat) => {
    setEditingId(chat.id);
    setNewName(chat.name);
  };

  const handleUpdate = async (id: string) => {
    try {
      await updateDoc(doc(db, "chats", id), { name: newName });
      setEditingId(null);
      fetchChats();
    } catch (error) {
      console.error("Error updating chat:", error);
    }
  };
  /* 
  const addChat = async () => {
    try {
      const newChat: Chat = {
        id: "",
        name: "New Chat",
        messages: [],
      };
      const docRef = await addDoc(collection(db, "chats"), newChat);
      newChat.id = docRef.id;
      setChats([...chats, newChat]);
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const renameChat = async (id: string, newName: string) => {
    try {
      await updateDoc(doc(db, "chats", id), { name: newName });
      fetchChats();
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const deleteChat = async (id: string) => {
    try {
      await deleteDoc(doc(db, "chats", id));
      fetchChats();
    } catch (error) {
      console.error("Error deleting chat:", error);
    }
  }; */

  return (
    <Box>
      <List>
        {chats.map((chat) => (
          <ListItem key={chat.id}>
            <ListItemText primary={chat.name} />
            <IconButton onClick={() => handleEdit(chat)}>
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(chat.id)}>
              <DeleteIcon />
            </IconButton>
            {editingId === chat.id ? (
              <TextField
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={() => handleUpdate(chat.id)}
              />
            ) : null}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default ChatHistory;
