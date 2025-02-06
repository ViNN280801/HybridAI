"use client";

import { useSearch } from ".";

import type { Token } from "@/db/types";

export const useTokenSearch = (input: string) => {
  const { results, loading } = useSearch<Token>(input, "/api/tokens/search");

  return {
    results,
    loading,
  };
};
