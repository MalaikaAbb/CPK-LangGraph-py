"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The Quickstart's chat, pointed at the `sample_agent` graph.
 *
 * The page's own final step drops in `<CopilotSidebar />` with no props. A
 * `<CopilotChat>` is used instead so the demo fills the frame rather than
 * docking inside it — the Sidebar route is where that surface gets exercised.
 * The suggestions are the page's three "Start chatting!" prompts.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/quickstart" subtitle="graph: sample_agent">
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      { title: "Tell me a joke", message: "Can you tell me a joke?" },
      { title: "Explain AI", message: "Can you help me understand AI?" },
      { title: "On React", message: "What do you think about React?" },
    ],
    available: "always",
  });

  return <CopilotChat agentId="sample_agent" className="h-full" />;
}
