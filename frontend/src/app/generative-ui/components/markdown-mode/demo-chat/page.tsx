"use client";

// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { MarkdownProviders, OwnPromptProviders } from "./providers";

const VARIANTS = [
  {
    id: "markdown",
    label: "transport: \"markdown\"",
    note: "The provider sends the schema and the fence guide as context; the genui LangGraph graph folds the run's context entries into its system prompt.",
    Provider: MarkdownProviders,
  },
  {
    id: "own-prompt",
    label: "sendContext: false",
    note: "No context entries. The catalog travels only in forwardedProps.copilotkit.ui, which this agent never reads — so expect no UI.",
    Provider: OwnPromptProviders,
  },
] as const;

export default function DemoPage() {
  const [current, setCurrent] = useState<(typeof VARIANTS)[number]>(VARIANTS[0]);
  const { Provider } = current;

  return (
    <DemoFrame parentPath="/generative-ui/components/markdown-mode" subtitle="a2ui code blocks">
      <div className="flex h-full flex-col">
        <div className="shrink-0 space-y-1 border-b border-slate-200 p-2 dark:border-slate-800">
          <div className="flex gap-2">
            {VARIANTS.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrent(v)}
                className={`rounded-md border px-3 py-1 text-xs font-medium ${
                  current.id === v.id
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500">{current.note}</p>
        </div>
        <div className="min-h-0 flex-1" key={current.id}>
          <Provider>
            <CopilotChat
              labels={{
                welcomeMessageText:
                  "Try: give me a seat-count slider that shows the monthly price at $29 per seat.",
              }}
            />
          </Provider>
        </div>
      </div>
    </DemoFrame>
  );
}
