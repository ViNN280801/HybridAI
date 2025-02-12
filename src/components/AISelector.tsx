// HybridAI/src/components/AISelector.tsx

export default function AISelector() {
  return (
    <div className="ai-selector">
      <select id="aiSelect" className="ai-select">
        <option value="deepseek">DeepSeek</option>
        <option value="claude">Claude 3.5</option>
        <option value="chatgpt">ChatGPT</option>
        <option value="gemini">Gemini</option>
      </select>
    </div>
  );
}
