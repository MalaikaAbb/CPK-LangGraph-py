"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Reading agent state — the page's `useAgent` + `agent.state.language` snippet,
 * shown as a live readout beside the chat.
 *
 * The page's own example is three lines and this is those three lines plus a
 * panel to see them in. The read path is deliberately passive: nothing here
 * writes, and the graph exposes no tool the agent could use to write either —
 * neither doc page defines one. The slot is changed from the UI on the Writing
 * route, and this readout follows because both routes share one agent and one
 * state object.
 *
 * The `?? "english"` fallback is the page's, and it explains why: "a default
 * value in a state class is not read on runtime", so state can legitimately be
 * empty on the first render.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-read"
      subtitle="graph: shared-state-language"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "shared-state-language",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const language = (agent.state?.language as string) ?? "english";

  useConfigureSuggestions({
    suggestions: [
      { title: "Ask something", message: "What is a checkpointer for?" },
      { title: "Ask again", message: "Give me one tip for writing prompts." },
    ],
    available: "always",
  });

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[340px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Your main content
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Read straight off{" "}
          <code className="font-mono text-xs">agent.state.language</code>. This
          panel never writes.
        </p>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Language
          </p>
          <p
            data-testid="language-readout"
            className="mt-1 text-2xl font-semibold capitalize text-slate-900 dark:text-slate-100"
          >
            {language}
          </p>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Nothing on this page writes. The agent has no tool for changing the
          language either — neither doc page defines one. Flip it on{" "}
          <a
            href="/shared-state/in-app-agent-write/demo-chat"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Writing agent state
          </a>
          , then come back: it is the same agent and the same state object, so
          this readout follows.
        </p>
      </div>

      <div className="min-h-[24rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="shared-state-language" className="h-full" />
      </div>
    </div>
  );
}
