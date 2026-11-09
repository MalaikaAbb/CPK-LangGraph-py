"use client";

// Borrowed from the CopilotKit showcase, NOT published on the doc page (its
// Code tab imports this file without showing it):
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/mcp-apps/chat.tsx

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useMcpAppsSuggestions } from "./suggestions";

export function Chat() {
  useMcpAppsSuggestions();
  return <CopilotChat agentId="mcp-apps" className="h-full rounded-2xl" />;
}
