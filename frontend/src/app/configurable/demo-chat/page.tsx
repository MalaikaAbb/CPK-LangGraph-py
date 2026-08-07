"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";
import { useEffect } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's Configurable cell.
 *
 * `forwardedProps.config.configurable` carries per-run execution parameters —
 * auth tokens, session metadata — that are deliberately *not* agent state: they
 * do not persist, the agent cannot write them back, and they never appear in
 * `agent.state`.
 *
 * The page's warning about `runAgent` is reproduced in the effect below:
 * calling it in the component body would fire on every render and produce
 * "thread is already processing" errors. An empty-dependency `useEffect` runs
 * it once.
 *
 * Two keys are forwarded on purpose — one declared in `ConfigSchema`, one not —
 * so the route can show what actually survives the trip. See the notes page.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/configurable" subtitle="graph: configurable">
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "configurable",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  // Do not call runAgent directly in the component body: it would run on every
  // render and can trigger errors such as "thread is already processing".
  useEffect(() => {
    agent.runAgent({
      forwardedProps: {
        config: {
          configurable: {
            authToken: "example-token"
          },
          recursion_limit: 50,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const received = (agent.state?.received_config ?? {}) as Record<
    string,
    unknown
  >;

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[380px_1fr]">
      <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          What the graph received
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Read from{" "}
          <code className="font-mono text-xs">config[&apos;configurable&apos;]</code>{" "}
          inside the node and echoed back into state so it is visible here.
        </p>

        <div className="mt-4 space-y-2">
          <Row
            label="authToken"
            note="declared in ConfigSchema"
            value={received.authToken}
          />
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Ask the agent about its auth token in the chat — it was told what it
          is for this run.
        </p>
      </div>

      <div className="min-h-[24rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="configurable" className="h-full" />
      </div>
    </div>
  );
}

function Row({
  label,
  note,
  value,
}: {
  label: string;
  note: string;
  value: unknown;
}) {
  const arrived = value !== undefined && value !== null;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center justify-between gap-2">
        <code className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
          {label}
        </code>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${
            arrived
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
              : "border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900"
          }`}
        >
          {arrived ? "arrived" : "absent"}
        </span>
      </div>
      <p className="mt-0.5 text-[11px] text-slate-500">{note}</p>
      {arrived && (
        <p className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
          {String(value)}
        </p>
      )}
    </div>
  );
}
