// HybridAI/src/services/ai.ts

import axios from "axios";
import { RateLimiter } from "../../backend/utils/rateLimiter";
const rateLimiter = new RateLimiter(10, 60_000);

export const fetchAIResponse = async (
  query: string,
  model: string,
  walletAddress: string
) => {
  try {
    if (!rateLimiter.checkLimit(walletAddress)) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }

    const response = await axios.post("/api/ai", {
      query,
      model,
      walletAddress,
    });

    rateLimiter.increment(walletAddress);
    return response.data.response;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      throw new Error(
        err.response?.data?.error || "Failed to fetch AI response"
      );
    }
    throw err;
  }
};
