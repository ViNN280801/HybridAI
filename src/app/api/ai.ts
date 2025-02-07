// HybridAI/src/pages/api/ai.ts

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { query, model } = req.body;
    const response = await axios.post(`https://api.${model}.com/query`, {
      query,
    });
    res.status(200).json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch AI response" });
  }
}
