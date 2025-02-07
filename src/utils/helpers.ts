// HybridAI/src/utils/helpers.ts

export const formatError = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred";
};
