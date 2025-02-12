// HybridAI/src/components/CentralWidget.tsx

import Image from "next/image";
import AISelector from "@/components/AISelector";

export default function CentralWidget({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="container">
      <header className="app-header">
        <h1 className="heading">Hybrid.Ai</h1>
        <h2 className="sub-heading">
          How can <span className="gradient-text">We</span> help you?
        </h2>
      </header>

      <div className="suggestions">
        {[
          { id: "deepseek", icon: "deepseek_logo.png", title: "DeepSeek" },
          { id: "claude", icon: "claude_3.5_logo.png", title: "Claude 3.5" },
          { id: "chatgpt", icon: "chatgpt_logo.png", title: "ChatGPT" },
          { id: "gemini", icon: "gemini_logo.png", title: "Gemini" },
        ].map((item) => (
          <a key={item.id} href="#" className="suggestion-item">
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
              <p>Sample description</p>
            </div>
          </a>
        ))}
      </div>

      <div className="chats-container"></div>

      <div className="prompt-container">
        <div
          className="prompt-wrapper"
          style={{ marginRight: "100px", alignItems: "center" }}
        >
          <form action="#" className="prompt-form">
            <input
              type="text"
              placeholder="Ask Hybrid.Ai anything..."
              className="prompt-input"
              required
            />
            <div className="prompt-actions">
              <button id="send-prompt-btn" className="material-symbols-rounded">
                arrow_upward
              </button>
            </div>
          </form>
          <button type="button" className="material-symbols-rounded">
            stop
          </button>
          <button type="button" className="material-symbols-rounded">
            light_mode
          </button>
          <button type="button" className="material-symbols-rounded">
            delete
          </button>
        </div>
        <p className="disclaimer-text">
          Hybrid.Ai can make mistakes, so double check it
        </p>
      </div>

      <div className="central-controls">
        <button
          className="collapse-btn"
          onClick={onToggle}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="material-symbols-rounded">
            {isCollapsed ? "chevron_right" : "chevron_left"}
          </span>
        </button>
        <AISelector />
      </div>
    </div>
  );
}
