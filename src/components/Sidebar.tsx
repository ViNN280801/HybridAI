// HybridAI/src/components/Sidebar.tsx

"use client";

import React, { useState } from "react";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { Moon, Sun } from "lucide-react";

const Sidebar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Box className="sidebar">
      <Typography variant="h6">HybridAI</Typography>
      <IconButton className="theme-switch" onClick={toggleTheme}>
        {theme === "dark" ? <Sun /> : <Moon />}
      </IconButton>
      <Typography variant="subtitle1">Chat History</Typography>
      <Button className="new-chat-button" variant="contained">
        + New Chat
      </Button>
      <Button className="account-button" variant="contained">
        Account
      </Button>
      <Button className="logout-button" variant="contained">
        Log out
      </Button>
    </Box>
  );
};

export default Sidebar;
