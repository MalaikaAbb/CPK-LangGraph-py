"use client";

import {
  CopilotChat,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `agent-config` cell.
 *
 * langgraph-python is a `shared-state` framework in the page's own taxonomy, so
 * config travels as runtime context rather than provider properties: the UI
 * holds a typed object, `ConfigContextRelay` publishes it with
 * `useAgentContext`, and the backend rebuilds its system prompt from it on
 * every turn.
 *
 * `ConfigContextRelay` is a separate null-rendering component, exactly as the
 * page writes it. That is not ceremony — keeping the hook out of the panel
 * means editing a select does not re-register the context entry mid-render.
 */
type AgentConfig = {
  tone: string;
  expertise: string;
  responseLength: string;
};

const OPTIONS: Record<keyof AgentConfig, string[]> = {
  tone: ["professional", "friendly", "playful", "formal"],
  expertise: ["beginner", "intermediate", "expert"],
  responseLength: ["concise", "balanced", "detailed"],
};

export default function Page() {
  const [config, setConfig] = useState<AgentConfig>({
    tone: "professional",
    expertise: "intermediate",
    responseLength: "concise",
  });

  return (
    <DemoFrame parentPath="/agent-config" subtitle="graph: agent-config">
      <ConfigContextRelay config={config} />
      <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[340px_1fr]">
        <div className="overflow-y-auto rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Agent config
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Published as runtime context. The backend rebuilds its system prompt
            from these three fields every turn.
          </p>

          <div className="mt-5 space-y-4">
            {(Object.keys(OPTIONS) as (keyof AgentConfig)[]).map((key) => (
              <div key={key}>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {key}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {OPTIONS[key].map((option) => (
                    <button
                      key={option}
                      type="button"
                      data-testid={`config-${key}-${option}`}
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, [key]: option }))
                      }
                      className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                        config[key] === option
                          ? "bg-[var(--accent)] text-white"
                          : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-xs text-slate-500">
            Ask the same question at{" "}
            <code className="font-mono">beginner</code> and then{" "}
            <code className="font-mono">expert</code> — the answers should be
            visibly different.
          </p>
        </div>

        <div className="min-h-[24rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <Chat />
        </div>
      </div>
    </DemoFrame>
  );
}

function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Explain a concept",
        message: "What is a vector database and when would I need one?",
      },
      {
        title: "Ask for advice",
        message: "How should I decide between fine-tuning and RAG?",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="agent-config" className="h-full" />;
}
