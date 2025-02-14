// HybridAi/src/components/ErrorModal.tsx

import useStore from "@/lib/store";

export default function ErrorModal({ message }: { message: string | null }) {
  const { setError } = useStore();

  const createLinkedText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="error-link"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  if (!message) return null;

  return (
    <div className="error-overlay">
      <div className="error-modal">
        <div className="error-icon">⚠️</div>
        <div className="error-text">{createLinkedText(message)}</div>
        <button className="close-btn" onClick={() => setError(null)}>
          Close
        </button>
      </div>
    </div>
  );
}
