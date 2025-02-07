// HybridAI/src/pages/index.tsx

import dynamic from "next/dynamic";
const AI = dynamic(() => import("@/components/AI"), { ssr: false });

export default function Home() {
  return (
    <div className="home-content">
      <h1>How can We help you?</h1>
      <p>Smarter Solutions, Powered by Technology and Trust</p>
      <AI />
    </div>
  );
}
