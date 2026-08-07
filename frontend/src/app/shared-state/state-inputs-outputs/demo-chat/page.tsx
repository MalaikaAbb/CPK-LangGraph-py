"use client";

import {
  UseAgentUpdate,
  useAgent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Input/Output Schemas — the three slots and what actually crosses the wire.
 *
 * There is deliberately no chat here. The page's whole subject is which state
 * travels in each direction, and a chat composer would muddy that: `question`
 * is set by the UI, `answer` comes back from the agent, and `resources` is
 * written by the agent for itself and filtered out by `output_schema` before
 * the frontend ever sees it.
 *
 * The page's own expectations, quoted:
 *   - "While we are able to provide a question, we will not receive it back
 *      from the agent. If we are using it in our UI, we need to remember the
 *      UI is the source of truth for it"
 *   - "Answer will change once it's returned back from the agent"
 *   - "The UI has no access to resources."
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/state-inputs-outputs"
      subtitle="graph: state-inputs-outputs"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "state-inputs-outputs",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });
  const { copilotkit } = useCopilotKit();
  const [question, setQuestion] = useState(
    "What is a LangGraph checkpointer for?",
  );

  const state = (agent.state ?? {}) as Record<string, unknown>;

  const ask = () => {
    if (agent.isRunning || !question.trim()) return;
    // `question` is an input-schema slot: we write it, the agent reads it,
    // and it never comes back.
    agent.setState({ question });
    void copilotkit.runAgent({ agent }).catch((err) => {
      console.error("[state-inputs-outputs] runAgent failed", err);
    });
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Ask a question
          </h2>
          <div className="mt-3 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <button
              onClick={ask}
              disabled={agent.isRunning}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {agent.isRunning ? "Running…" : "Ask"}
            </button>
          </div>
        </div>

        <Slot
          name="question"
          kind="input"
          tone="sky"
          note="Set by the UI. Absent from output_schema, so it never comes back — the UI stays its own source of truth."
          value={state.question}
          uiValue={question}
        />
        <Slot
          name="answer"
          kind="output"
          tone="emerald"
          note="Written by the agent and returned. This is the one slot that fills in below."
          value={state.answer}
        />
        <Slot
          name="resources"
          kind="internal"
          tone="slate"
          note="Written by the agent for its own use. On neither schema, so LangGraph filters it out — permanently undefined here, however much the agent writes."
          value={state.resources}
        />
      </div>
    </div>
  );
}

function Slot({
  name,
  kind,
  tone,
  note,
  value,
  uiValue,
}: {
  name: string;
  kind: string;
  tone: "sky" | "emerald" | "slate";
  note: string;
  value: unknown;
  uiValue?: string;
}) {
  const tones = {
    sky: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
    emerald:
      "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200",
    slate:
      "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  } as const;

  const received = value === undefined ? undefined : value;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <code className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </code>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${tones[tone]}`}
        >
          {kind}
        </span>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{note}</p>

      {uiValue !== undefined && (
        <p className="mt-3 text-sm">
          <span className="text-slate-500">in the UI: </span>
          <span className="text-slate-800 dark:text-slate-200">{uiValue}</span>
        </p>
      )}

      <p className="mt-1 text-sm">
        <span className="text-slate-500">from agent.state: </span>
        {received === undefined ? (
          <span className="italic text-slate-400">undefined</span>
        ) : (
          <span className="text-slate-800 dark:text-slate-200">
            {typeof received === "string"
              ? received
              : JSON.stringify(received)}
          </span>
        )}
      </p>
    </div>
  );
}
