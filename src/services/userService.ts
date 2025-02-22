// HybridAI/src/services/userService.ts

import supabase from "@/lib/supabase";

interface User {
  id: string;
  wallet_address: string;
  created_at: string;
  updated_at: string;
  auth_provider: "phantom";
  verified: boolean;
}

export const getCurrentUser = async (wallet: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", wallet)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Ошибка получения пользователя:", error.message);
  }

  return data as User | null;
};

export const createOrUpdateUser = async (wallet: string): Promise<User> => {
  const existingUser = await getCurrentUser(wallet);

  if (existingUser) {
    console.log(`Пользователь ${wallet} уже зарегистрирован.`);
    return existingUser;
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      wallet_address: wallet,
      auth_provider: "phantom",
      verified: true,
    })
    .select()
    .single();

  if (error)
    throw new Error("Ошибка при создании пользователя: " + error.message);

  return data as User;
};
