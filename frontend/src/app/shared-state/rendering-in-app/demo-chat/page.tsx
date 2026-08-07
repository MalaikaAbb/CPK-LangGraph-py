"use client";

import {
  CopilotSidebar,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import type { Preferences } from "../../notes-card";

type CanvasState = {
  title: string;
  items: { id: string; label: string; done: boolean }[];
};

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/rendering-in-app"
      subtitle="graph: shared-state-read-write"
    >
      <div className="flex h-full">
        <Canvas />
        {/* Chat is just another consumer of the same agent. */}
        <CopilotSidebar agentId="shared-state-read-write" defaultOpen={true} />
      </div>
    </DemoFrame>
  );
}

function Canvas() {
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const state = (agent.state ?? {}) as Partial<CanvasState>;

  // The doc writes this as `agent.state?.items`, which is untyped — `it` comes
  // out implicitly `any` and the build fails. Mapping over the already-narrowed
  // `state` above gives the same result with real types. See README §9.
  function toggleItem(id: string) {
    agent.setState({
      ...agent.state,
      items: (state.items ?? []).map((it) =>
        it.id === id ? { ...it, done: !it.done } : it,
      ),
    });
  }

  return (
    <main className="canvas">
      <h1>{state.title ?? "Untitled"}</h1>
      <ul>
        {(state.items ?? []).map((item) => (
          <li key={item.id} data-done={item.done} onClick={() => toggleItem(item.id)}>
            {item.label}
          </li>
        ))}
      </ul>
    </main>
  );
}
