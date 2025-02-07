// HybridAI/src/services/auth.ts

import { signIn } from "next-auth/react";

export const signInWithGoogle = async () => {
  return signIn("google");
};

export const signInWithTwitter = async () => {
  return signIn("twitter");
};
