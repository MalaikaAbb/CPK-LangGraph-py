"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * Writing agent state — the page's `toggleLanguage` in both of its forms.
 *
 * The page shows the same handler twice. The basic version calls `setState` and
 * stops: the new value is used "next time the agent runs". The Advanced Usage
 * version adds `agent.runAgent()` immediately after, to re-run with the updated
 * state rather than waiting for the user's next message.
 *
 * Both buttons are here because the difference between them is the entire
 * lesson, and it is invisible unless you can compare.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/in-app-agent-write"
      subtitle="graph: shared-state-language"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  const { agent } = useAgent({
    agentId: "shared-state-language",
    updates: [UseAgentUpdate.OnStateChanged, UseAgentUpdate.OnRunStatusChanged],
  });

  const language = (agent.state?.language as string) ?? "english";

  useConfigureSuggestions({
    suggestions: [
      { title: "Tell me a joke", message: "Tell me a joke." },
      { title: "Say hello", message: "Say hello and introduce yourself." },
    ],
    available: "always",
  });

  // The page's basic form: write state, wait for the next run to pick it up.
  const toggleLanguage = () => {
    agent.setState({ language: language === "english" ? "spanish" : "english" });
  };

  // The page's Advanced Usage form: write state, then re-run immediately.
  const toggleLanguageAndRerun = () => {
    const newLanguage = language === "english" ? "spanish" : "english";
    agent.setState({ language: newLanguage });

    // re-run the agent with updated state
    void agent.runAgent();
  };

  return (
    <div className="grid h-full grid-cols-1 gap-4 p-4 lg:grid-cols-[340px_1fr]">
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Your main content
        </h2>

        <div className="mt-4">
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

        <div className="mt-5 space-y-2">
          <button
            type="button"
            data-testid="toggle-language"
            onClick={toggleLanguage}
            disabled={agent.isRunning}
            className="w-full rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Toggle Language
          </button>
          <p className="text-xs text-slate-500">
            Writes state only. Send a message afterwards to see it take effect.
          </p>

          <button
            type="button"
            data-testid="toggle-language-rerun"
            onClick={toggleLanguageAndRerun}
            disabled={agent.isRunning}
            className="mt-3 w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
          >
            Toggle + re-run
          </button>
          <p className="text-xs text-slate-500">
            Writes state, then calls{" "}
            <code className="font-mono">agent.runAgent()</code> — the agent
            responds again straight away.
          </p>
        </div>
      </div>

      <div className="min-h-[24rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="shared-state-language" className="h-full" />
      </div>
    </div>
  );
}
