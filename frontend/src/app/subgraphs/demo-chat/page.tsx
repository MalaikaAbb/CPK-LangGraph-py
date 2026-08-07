"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Subgraphs — watching a nested graph's writes stream in real time.
 *
 * The page publishes exactly one snippet, the `useAgent` call below, and says
 * that using subgraphs "requires no extra steps on the agent side. All you need
 * to do is subscribe to the agent state in your frontend."
 *
 * That claim is what this route tests. `findings` is written entirely from
 * inside the nested `research` subgraph, across two of its nodes. If subgraph
 * streaming works, entries appear while the subgraph is still running and
 * before the parent's `summarize` node has begun. If they were buffered to the
 * parent boundary, everything would land at once at the end.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/subgraphs" subtitle="graph: subgraphs">
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "subgraphs",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  // Access agent state as usual - subgraph streaming is handled automatically
  const state = agent.state ?? {};
  const findings = (state.findings as string[]) ?? [];
  const stage = (state.stage as string) ?? "idle";

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Research a topic",
        message: "Tell me about the history of the shipping container.",
      },
      {
        title: "Something technical",
        message: "Tell me about how vector databases index embeddings.",
      },
    ],
    available: "always",
  });

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[380px_1fr]">
      <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Findings
          </h2>
          <span
            data-testid="subgraph-stage"
            className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
          >
            {stage}
          </span>
          {agent.isRunning && (
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          )}
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Written from inside the nested <code className="font-mono">research</code>{" "}
          subgraph — not by any parent node.
        </p>

        {findings.length === 0 ? (
          <p className="mt-6 text-sm italic text-slate-500">
            Ask about a topic. Findings appear here while the subgraph is still
            running, before the parent summarizes.
          </p>
        ) : (
          <ul data-testid="subgraph-findings" className="mt-4 space-y-2">
            {findings.map((f, i) => (
              <li
                key={`${f}-${i}`}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200"
              >
                {f}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="min-h-[24rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="subgraphs" className="h-full" />
      </div>
    </div>
  );
}
