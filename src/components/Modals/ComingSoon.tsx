// HybridAI/src/components/ComingSoon.tsx

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ComingSoon({ onClose }: { onClose: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="coming-soon-overlay"
        >
          <div className="coming-soon-content">
            <button
              className="coming-soon-close-btn"
              onClick={() => {
                setIsVisible(false);
                onClose();
              }}
            >
              <span className="material-symbols-rounded">close</span>
            </button>
            <span className="material-symbols-rounded animate-pulse">
              construction
            </span>
            <h2>Feature in Development</h2>
            <p>This section is currently under construction</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
