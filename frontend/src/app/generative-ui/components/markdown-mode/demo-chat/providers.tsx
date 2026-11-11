"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

// The page prints both providers as bare JSX with `{children}`; the function
// around each is harness glue. Harness change in both: `runtimeUrl` — the
// page's is "/api/copilotkit".

/** "Turn it on" (`app/providers.tsx`). */
export function MarkdownProviders({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider runtimeUrl="/api/copilotkit-genui" generativeUI={{ ui: standardUI, transport: "markdown" }}>
      {children}
    </CopilotKitProvider>
  );
}

/** "Build your own prompt". */
export function OwnPromptProviders({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit-genui"
      generativeUI={{ ui: standardUI, transport: "markdown", sendContext: false }}
    >
      {children}
    </CopilotKitProvider>
  );
}
