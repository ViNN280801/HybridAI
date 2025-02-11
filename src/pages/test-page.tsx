import Link from "next/link";

export default function TestPage() {
  return (
    <>
      <div className="sidebar" id="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="logo-container">
            <span className="logo-text">Hybrid.Ai</span>
          </Link>
        </div>

        <div className="sidebar-menu">
          <a href="#" className="menu-item active" id="chatsMenuItem">
            <span className="material-symbols-rounded">chat</span>
            <span className="menu-text">Chats</span>
            <span className="new-chat material-symbols-rounded">add</span>
          </a>

          <a href="#" className="menu-item">
            <span className="material-symbols-rounded">person</span>
            <span className="menu-text">Account</span>
          </a>

          <a href="#" className="menu-item">
            <span className="material-symbols-rounded">wallet</span>
            <span className="menu-text">Wallet</span>
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="social-links">
            <a href="#" className="social-link">
              <span className="material-symbols-rounded">flutter_dash</span>
              <span className="social-text">Follow Us</span>
            </a>
            <a href="#" className="social-link">
              <span className="material-symbols-rounded">forum</span>
              <span className="social-text">Join Discord</span>
            </a>
          </div>
        </div>
      </div>

      <div className="sidebar-controls">
        <button className="collapse-btn" id="collapseBtn">
          <span className="material-symbols-rounded">chevron_left</span>
        </button>
        <div className="ai-selector">
          <select id="aiSelect" className="ai-select">
            <option value="hybrid">Hybrid.AI</option>
            <option value="claude">Claude 3.5</option>
            <option value="chatgpt">ChatGPT</option>
            <option value="gemini">Gemini</option>
          </select>
        </div>
      </div>

      <div className="container">
        <header className="app-header">
          <h1 className="heading">Hybrid.Ai</h1>
          <h2 className="sub-heading">How can I help you?</h2>
        </header>

        <div className="suggestions">
          {[...Array(4)].map((_, i) => (
            <a key={i} href="#" className="suggestion-item">
              <span className="material-symbols-rounded">icon_{i}</span>
              <div className="suggestion-content">
                <h3>Placeholder {i + 1}</h3>
                <p>Sample description</p>
              </div>
            </a>
          ))}
        </div>

        <div className="chats-container"></div>

        <div className="prompt-container">
          <div className="prompt-wrapper">
            <form action="#" className="prompt-form">
              <input
                type="text"
                placeholder="Ask Hybrid.Ai Anything..."
                className="prompt-input"
                required
              />
              <div className="prompt-actions">
                <button
                  id="send-prompt-btn"
                  className="material-symbols-rounded"
                >
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
      </div>
    </>
  );
}
