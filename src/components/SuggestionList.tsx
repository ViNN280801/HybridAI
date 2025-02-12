// HybridAI/src/components/SuggestionList.tsx

import React from "react";
import Image from "next/image";
import { promptPool } from "@/lib/prompt-pool";

// Define suggestion type with basic properties.
interface Suggestion {
  id: string; // model id, e.g. "deepseek", "claude", etc.
  icon: string; // path to icon image
  title: string; // displayed title
}

interface SuggestionListProps {
  // Now onSelect accepts an object with 'model' and 'prompt'
  onSelect: (selected: { model: string; prompt: string }) => void;
}

// Array of suggestion items.
// Note: for each model, phrases are taken from promptPool.
const suggestions: Suggestion[] = [
  { id: "deepseek", icon: "deepseek_logo.png", title: "DeepSeek" },
  { id: "claude", icon: "claude_3.5_logo.png", title: "Claude 3.5" },
  { id: "chatgpt", icon: "chatgpt_logo.png", title: "ChatGPT" },
  { id: "gemini", icon: "gemini_logo.png", title: "Gemini" },
];

// Utility function to retrieve a random phrase from the pool for the given model.
const getRandomPhrase = (modelId: string): string => {
  const pool = promptPool[modelId];
  if (pool && pool.length > 0) {
    return pool[Math.floor(Math.random() * pool.length)];
  }
  return "";
};

export default function SuggestionList({ onSelect }: SuggestionListProps) {
  return (
    <div className="suggestions">
      {suggestions.map((item) => {
        // Pick a random query from promptPool for current model.
        const phrase = getRandomPhrase(item.id);
        return (
          <a
            key={item.id}
            href="#"
            className="suggestion-item"
            onClick={(e) => {
              e.preventDefault();
              onSelect({ model: item.id, prompt: phrase });
            }}
          >
            {item.icon ? (
              <Image
                src={`/${item.icon}`}
                alt={item.title}
                className="w-6 h-6 object-contain mr-3"
                width={24}
                height={24}
              />
            ) : (
              <span className="text-lg font-bold mr-3">{item.title}</span>
            )}
            <div className="suggestion-content">
              <h3>{item.title}</h3>
              <p>{phrase}</p>
            </div>
          </a>
        );
      })}
    </div>
  );
}
