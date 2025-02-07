// HybridAI/src/app/page.tsx

"use client";

import dynamic from "next/dynamic";
const AI = dynamic(() => import("@/components/AI"), { ssr: false });

export default function Home() {
  return (
    <div>
      <h1>How can we help you?</h1>
      <p>Smarter Solutions, Powered by Technology and Trust</p>
      <AI />
    </div>
  );
}
