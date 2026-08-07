"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `agentic-chat` cell: a `<CopilotChat>` filling its container, with
 * starter suggestions wired in.
 *
 * The page's snippet is `function Chat() { useAgenticChatSuggestions(); return
 * <CopilotChat agentId="agentic_chat" />; }`. `useAgenticChatSuggestions` is
 * local to CopilotKit's own demo app and is exported by no package; it wraps
 * `useConfigureSuggestions`, which is a real export, so that is called directly.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/chat"
      subtitle="graph: agentic_chat"
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "What can you do?", message: "What can you help me with?" },
      {
        title: "Explain LangGraph",
        message: "What is LangGraph, in two sentences?",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="agentic_chat" className="h-full" />;
}
