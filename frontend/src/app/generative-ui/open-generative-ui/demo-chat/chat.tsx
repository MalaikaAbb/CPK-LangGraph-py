"use client";

// Borrowed from the CopilotKit showcase, NOT published on the doc page (its
// Code tab imports this file without showing it):
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/open-gen-ui/chat.tsx

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useOpenGenUISuggestions } from "./suggestions";

export function Chat() {
  useOpenGenUISuggestions();
  return <CopilotChat agentId="open-gen-ui" className="flex-1 rounded-2xl" />;
}
