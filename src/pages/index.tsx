// HybridAI/src/pages/index.tsx

import Head from "next/head";
import Sidebar from "@/components/Sidebar";
import ChatInput from "@/components/ChatInput";
import ChatHistory from "@/components/ChatHistory";
import { Box } from "@mui/material";

export default function Home() {
  return (
    <>
      <Head>
        <title>HybridICO - AI & Blockchain Powered</title>
      </Head>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" }, // Stack on mobile, row on larger screens
          height: "100vh",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            flex: { xs: "none", md: 3 }, // Takes 3 parts of the layout on larger screens
            borderRight: "1px solid #ccc",
            p: 2,
          }}
        >
          <Sidebar />
        </Box>

        {/* Chat Window */}
        <Box
          sx={{
            flex: { xs: "none", md: 9 }, // Takes 9 parts of the layout on larger screens
            overflowY: "auto",
            p: 2,
          }}
        >
          <ChatHistory />
          <ChatInput />
        </Box>
      </Box>
    </>
  );
}
