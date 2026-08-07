"use client";

import {
  CopilotSidebar,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DocumentCanvas } from "../../../shared-state/document-canvas";

/**
 * State Rendering, on the same `shared-state-streaming` agent the docs use for
 * both pages.
 *
 * The mechanism is identical to the State Streaming route — same graph, same
 * `useAgent` subscription. What differs is the framing: here the agent's state
 * *is* the application, and the chat is a docked sidebar off to one side. The
 * document is the main view rather than a pane beside a chat.
 *
 * That is the point the page makes about `useAgent`: it works in any component
 * under the provider, so nothing about rendering agent state is chat-specific.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/state-rendering"
      subtitle="graph: shared-state-streaming"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const document = (agent.state?.document as string) ?? "";

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Write a blog post",
        message: "Write a short blog post about shipping agents to production.",
      },
      {
        title: "Draft release notes",
        message: "Draft release notes for a version that added voice input.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full">
      <main className="min-w-0 flex-1 p-4">
        <DocumentCanvas
          document={document}
          isRunning={agent.isRunning}
          title="Live output"
        />
      </main>
      <CopilotSidebar agentId="shared-state-streaming" defaultOpen={true} />
    </div>
  );
}
