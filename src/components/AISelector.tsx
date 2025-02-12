// HybridAI/src/components/AISelector.tsx

import React from "react";

interface AISelectorProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function AISelector({ value, onChange }: AISelectorProps) {
  return (
    <div className="ai-selector">
      <select
        id="aiSelect"
        className="ai-select"
        value={value}
        onChange={onChange}
      >
        <option value="deepseek">DeepSeek</option>
        <option value="claude">Claude 3.5</option>
        <option value="chatgpt">ChatGPT</option>
        <option value="gemini">Gemini</option>
      </select>
    </div>
  );
}
