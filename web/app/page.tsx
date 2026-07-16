"use client";

import dynamic from "next/dynamic";

// The chat UI reads navigator.language on mount and needs no server-rendered
// markup (fully client-side, no persistence per spec), so SSR is skipped to
// avoid a language flash / hydration mismatch.
const ChatApp = dynamic(() => import("./chat-app"), { ssr: false });

export default function Home() {
  return <ChatApp />;
}
