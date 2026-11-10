"use client";

// Borrowed from the CopilotKit showcase, NOT published on the doc page (its
// Code tab imports this file without showing it). Its suggestion chips
// (./suggestions) were dropped as a demo extra: this is a bare <CopilotChat>.
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/mcp-apps/chat.tsx

import { CopilotChat } from "@copilotkit/react-core/v2";

export function Chat() {
  return <CopilotChat agentId="mcp-apps" className="h-full rounded-2xl" />;
}
