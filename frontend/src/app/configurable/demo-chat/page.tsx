"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's Configurable cell, after the page's trust-boundary rewrite.
 *
 * The browser no longer sends any execution config: no `runAgent` with
 * `forwardedProps.config`. The FastAPI backend builds a request-local agent
 * with the page's `build_agent(tenant_id)`, and the graph echoes what it was
 * given into `received_config` so this panel can show it.
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

  const received = (agent.state?.received_config ?? {}) as Record<
    string,
    unknown
  >;

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[380px_1fr]">
      <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          What the server gave the graph
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Read from{" "}
          <code className="font-mono text-xs">config</code> inside the graph
          and echoed back into state. Empty until the first run finishes.
        </p>

        <div className="mt-4 space-y-2">
          <Row
            label="configurable.tenant_id"
            note="set by build_agent on the server"
            value={received.tenant_id}
          />
          <Row
            label="recursion_limit"
            note="set by build_agent on the server"
            value={received.recursion_limit}
          />
        </div>
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
          {arrived ? "set" : "not yet"}
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
