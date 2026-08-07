"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DocumentCanvas } from "../../document-canvas";

/**
 * The doc's `shared-state-streaming` cell.
 *
 * The frontend half is four lines and the page prints them verbatim: subscribe
 * with `useAgent`, ask for both update kinds, read `agent.state.document`.
 * Everything that makes it stream is on the backend — `StateStreamingMiddleware`
 * mapping `write_document.document` into `state["document"]`.
 *
 * `OnStateChanged` alone would give you the text but not the LIVE badge;
 * `OnRunStatusChanged` is what tells you whether more is still coming.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/streaming"
      subtitle="graph: shared-state-streaming"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  // Subscribe to BOTH state changes and run-status changes. The former
  // drives the per-token document rerender; the latter toggles the
  // "LIVE" badge when the agent starts / stops.
  const { agent } = useAgent({
    agentId: "shared-state-streaming",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const document = (agent.state?.document as string) ?? "";

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Draft a short essay",
        message:
          "Write a short essay on why agent-native UIs beat chatbots.",
      },
      {
        title: "Draft an email",
        message:
          "Draft a friendly email telling a customer their renewal is coming up.",
      },
    ],
    available: "always",
  });

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <DocumentCanvas document={document} isRunning={agent.isRunning} />
      <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="shared-state-streaming" className="h-full" />
      </div>
    </div>
  );
}
