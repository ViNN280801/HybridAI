// HybridAI/src/components/RenameChatModal.tsx

"use client";

import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

interface RenameChatModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  currentName: string;
}

const RenameChatModal = ({
  open,
  onClose,
  onSubmit,
  currentName,
}: RenameChatModalProps) => {
  const [newName, setNewName] = useState<string>(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim() === "") {
      console.error("Error: new name is empty.");
      return;
    }
    onSubmit(newName.trim());
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Rename chat
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="New name"
            fullWidth
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default RenameChatModal;
