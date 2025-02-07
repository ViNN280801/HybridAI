// HybridAI/src/components/Auth.tsx

import React, { useState } from "react";
import { signInWithGoogle, signInWithTwitter } from "@/services/auth";
import { usePrivy } from "@privy-io/react-auth";

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = usePrivy();

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("An unexpected error occurred");
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    try {
      setLoading(true);
      await signInWithTwitter();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      await login();
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGoogleSignIn} disabled={loading}>
        Sign in with Google
      </button>
      <button onClick={handleTwitterSignIn} disabled={loading}>
        Sign in with Twitter
      </button>
      <button onClick={handleConnectWallet} disabled={loading}>
        Connect Wallet
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Auth;
