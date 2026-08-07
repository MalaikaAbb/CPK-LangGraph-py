"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { DelegationLog, type Delegation } from "../delegation-log";

/**
 * The doc's `subagents` cell.
 *
 * The frontend half is exactly what the page describes: subscribe with
 * `useAgent({ updates: [OnStateChanged, OnRunStatusChanged] })`, read
 * `agent.state.delegations`, render one card per entry.
 *
 * What makes the log live is on the backend — each delegation tool returns a
 * `Command` that appends to the `delegations` slot as it completes, so entries
 * arrive one at a time while the supervisor is still working rather than all at
 * once at the end.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/multi-agent/subagents" subtitle="graph: subagents">
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "subagents",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const delegations = (agent.state?.delegations as Delegation[]) ?? [];

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Write a short paragraph",
        message:
          "Write a short paragraph explaining why agent-native UIs beat chatbots.",
      },
      {
        title: "Explain a trade-off",
        message:
          "Write a paragraph on the trade-offs of running LLM agents at the edge.",
      },
    ],
    available: "always",
  });

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[1fr_420px]">
      <DelegationLog delegations={delegations} isRunning={agent.isRunning} />
      <div className="min-h-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="subagents" className="h-full" />
      </div>
    </div>
  );
}
