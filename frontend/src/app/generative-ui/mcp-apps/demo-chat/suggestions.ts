"use client";

// Borrowed from the CopilotKit showcase, NOT published on the doc page (its
// Code tab imports this file without showing it):
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/mcp-apps/suggestions.ts
import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export function useMcpAppsSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Draw a flowchart",
        message: "Use Excalidraw to draw a simple flowchart with three steps.",
      },
      {
        title: "Sketch a system diagram",
        message:
          "Open Excalidraw and sketch a system diagram with a client, server, and database.",
      },
    ],
    available: "always",
  });
}
