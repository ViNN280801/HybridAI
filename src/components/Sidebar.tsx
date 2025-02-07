// HybridAI/src/components/Sidebar.tsx

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Box, IconButton, Typography, Button } from "@mui/material";
import { Moon, Sun } from "lucide-react";
import ChatHistory from "./ChatHistory";

const Sidebar = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Box
      sx={{
        p: 2,
        backgroundColor: theme === "dark" ? "#222" : "#f5f5f5",
        minHeight: "100vh",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Image src="/missing_texture.png" alt="Logo" width={40} height={40} />
        <Typography variant="h6" sx={{ ml: 1 }}>
          HybridAI
        </Typography>
        <IconButton onClick={toggleTheme} sx={{ ml: "auto" }}>
          {theme === "dark" ? <Moon /> : <Sun />}
        </IconButton>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1">Chat History</Typography>
        <ChatHistory />
        <Button variant="outlined" size="small">
          + New Chat
        </Button>
      </Box>
      <Box sx={{ mt: "auto" }}>
        <Link href="/account">
          <Button variant="contained" fullWidth sx={{ mb: 1 }}>
            Account
          </Button>
        </Link>
        <Button variant="outlined" fullWidth>
          Log out
        </Button>
      </Box>
    </Box>
  );
};

export default Sidebar;
