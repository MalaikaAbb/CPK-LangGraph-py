"use client";

// Borrowed from the CopilotKit showcase:
// https://github.com/CopilotKit/CopilotKit/blob/a358fa06ee1ee05a2e8a61f85461bdbabffbbd77/showcase/integrations/langgraph-typescript/src/app/demos/gen-ui-interrupt/suggestions.ts
// The doc page publishes the @region parts of this file verbatim.

import { useConfigureSuggestions } from "@copilotkit/react-core/v2";

export function useGenUiInterruptSuggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message: "Book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });
}
