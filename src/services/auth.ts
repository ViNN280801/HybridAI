// HybridAI/src/pages/auth.tsx

import { signIn } from "next-auth/react";

export const signInWithGoogle = async () => {
  return signIn("google", { callbackUrl: "/" });
};

export const signInWithTwitter = async () => {
  return signIn("twitter", { callbackUrl: "/" });
};
