// HybridAI/src/pages/auth.tsx

// Authentication service using next-auth (or your preferred auth solution)
import { signIn } from "next-auth/react";

export const signInWithGoogle = async () => signIn("google");
export const signInWithTwitter = async () => signIn("twitter");
