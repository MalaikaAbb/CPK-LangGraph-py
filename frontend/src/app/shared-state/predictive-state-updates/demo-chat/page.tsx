"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Every variant the page offers, nested the way the page nests them:
 * `agent-type` first, then `state-emission` within the custom-graph branch.
 *
 *   Custom graph ─┬─ Manual emission   copilotkit_emit_state, called by hand
 *                 └─ Tool emission     copilotkit_customize_config mapping
 *   Prebuilt agent ─  StateStreamingMiddleware(StateItem({ … }))
 *
 * Three separate graphs, three separate threads. The observable result should
 * be the same in all three — `observed_steps` filling before the answer
 * arrives — which is the whole reason for putting them side by side.
 */
type AgentType = "custom-graph" | "prebuilt";
type Emission = "manual-emission" | "tool-emission";

interface Variant {
  agentId: string;
  label: string;
  blurb: string;
  prompt: string;
}

const CUSTOM_GRAPH: Record<Emission, Variant> = {
  "manual-emission": {
    agentId: "predictive-state-manual-emission",
    label: "Manual emission",
    blurb:
      "The node calls copilotkit_emit_state itself, whenever it likes. Nothing is tied to a tool call — this variant walks a fixed list with a one-second pause, which is the page's own simulation of long-running work.",
    prompt: "Run the analysis",
  },
  "tool-emission": {
    agentId: "predictive-state-tool-emission",
    label: "Tool emission",
    blurb:
      "No manual calls. copilotkit_customize_config maps step_progress_tool's steps argument onto observed_steps, so the list fills from the model's own tool-call arguments as they stream.",
    prompt: "Plan and execute a data migration",
  },
};

const PREBUILT: Variant = {
  agentId: "predictive-state-prebuilt",
  label: "Prebuilt agent",
  blurb:
    "create_agent owns the loop. The same mapping is declared once as StateStreamingMiddleware(StateItem(…)) and never mentioned again.",
  prompt: "Plan and execute a data migration",
};

export default function Page() {
  const [agentType, setAgentType] = useState<AgentType>("custom-graph");
  const [emission, setEmission] = useState<Emission>("tool-emission");

  const variant =
    agentType === "custom-graph" ? CUSTOM_GRAPH[emission] : PREBUILT;

  return (
    <DemoFrame
      parentPath="/shared-state/predictive-state-updates"
      subtitle={`graph: ${variant.agentId}`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <div className="shrink-0 border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-2 px-4 pt-2">
            <Tab
              active={agentType === "custom-graph"}
              onClick={() => setAgentType("custom-graph")}
            >
              Custom graph
            </Tab>
            <Tab
              active={agentType === "prebuilt"}
              onClick={() => setAgentType("prebuilt")}
            >
              Prebuilt agent
            </Tab>
          </div>

          {/* Second level, only where the page has one. */}
          <div className="flex min-h-[2.25rem] items-center gap-2 px-4 pb-2 pt-2">
            {agentType === "custom-graph" ? (
              (Object.keys(CUSTOM_GRAPH) as Emission[]).map((key) => (
                <Tab
                  key={key}
                  small
                  active={emission === key}
                  onClick={() => setEmission(key)}
                >
                  {CUSTOM_GRAPH[key].label}
                </Tab>
              ))
            ) : (
              <span className="text-[11px] text-slate-400">
                No sub-variants — middleware replaces the emission choice.
              </span>
            )}
          </div>
        </div>

        {/* Keyed by agent id so switching remounts against the new graph
            rather than reusing the previous agent's subscription. */}
        <VariantPane key={variant.agentId} variant={variant} />
      </div>
    </DemoFrame>
  );
}

function Tab({
  active,
  small,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md font-medium ${
        small ? "px-2.5 py-0.5 text-[11px]" : "px-3 py-1 text-xs"
      } ${
        active
          ? "bg-[var(--accent)] text-white"
          : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

type AgentState = {
  observed_steps?: string[];
};

function VariantPane({ variant }: { variant: Variant }) {
  const { agent } = useAgent({
    agentId: variant.agentId,
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const state = (agent.state ?? {}) as AgentState;
  const steps = state.observed_steps ?? [];

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_24rem]">
      <main className="flex min-h-0 flex-col overflow-hidden p-8">
        <header className="flex shrink-0 flex-wrap items-center gap-2">
          <h1 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
            state[&quot;observed_steps&quot;]
          </h1>
          {agent.isRunning && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          )}
          <span className="ml-auto font-mono text-xs text-slate-400">
            {steps.length} steps
          </span>
        </header>

        <p className="mt-2 shrink-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <strong className="font-semibold">{variant.label}:</strong>{" "}
          {variant.blurb}
        </p>

        <p className="mt-2 shrink-0 text-xs text-slate-500">
          Try: <code>{variant.prompt}</code>
        </p>

        <div className="mt-3 min-h-0 flex-1 overflow-y-auto rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {steps.length > 0 ? (
            <ol className="space-y-2">
              {steps.map((step, i) => (
                <li
                  key={`${i}-${step}`}
                  className="flex gap-3 text-sm text-slate-800 dark:text-slate-200"
                >
                  <span className="select-none font-mono text-xs text-slate-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">
              Send the prompt above and watch the list fill before the answer
              arrives.
            </p>
          )}
        </div>
      </main>

      <div className="min-h-0 border-t border-slate-200 lg:border-l lg:border-t-0 dark:border-slate-800">
        <CopilotChat agentId={variant.agentId} className="h-full" />
      </div>
    </div>
  );
}
