// HybridAI/src/components/AuthButtons.tsx

"use client";

import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import { signInWithGoogle, signInWithTwitter } from "@/services/auth";
import { usePrivy } from "@privy-io/react-auth";

const AuthButtons = () => {
  const [loading, setLoading] = useState(false);
  const { login } = usePrivy();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Error signing in with Google:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setLoading(true);
    try {
      await signInWithTwitter();
    } catch (err) {
      console.error("Error signing in with Twitter:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    setLoading(true);
    try {
      await login();
    } catch (err) {
      console.error("Error connecting wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Button
        variant="contained"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        Sign in with Google
      </Button>
      <Button
        variant="contained"
        onClick={handleTwitterSignIn}
        disabled={loading}
      >
        Sign in with Twitter
      </Button>
      <Button
        variant="contained"
        onClick={handleConnectWallet}
        disabled={loading}
      >
        Connect Wallet
      </Button>
    </Box>
  );
};

export default AuthButtons;
