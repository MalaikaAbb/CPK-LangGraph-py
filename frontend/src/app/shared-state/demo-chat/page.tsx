"use client";

import {
  CopilotChat,
  UseAgentUpdate,
  useAgent,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { NotesCard, type Preferences } from "../notes-card";
import { PreferencesCard } from "../preferences-card";

/**
 * The doc's `shared-state-read-write` cell: both directions of the channel on
 * one screen.
 *
 * READ  — `notes` is written by the agent's `set_notes` tool and rendered here.
 * WRITE — `preferences` is written here by `agent.setState` and read back into
 *         the system prompt by `PreferencesInjectorMiddleware` on the next turn.
 *
 * Both snippets below are the page's, including its comments on each side.
 */
type RWAgentState = {
  notes: string[];
  preferences: Preferences;
};

const DEFAULT_PREFERENCES: Preferences = { tone: "neutral", detail: "normal" };

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state"
      subtitle="graph: shared-state-read-write"
    >
      <Layout />
    </DemoFrame>
  );
}

function Layout() {
  // Subscribe the component to agent state changes. Any time the agent
  // mutates its state (e.g. via its `set_notes` tool) this hook fires,
  // we re-render, and the sidebar panels reflect the new values.
  const { agent } = useAgent({
    agentId: "shared-state-read-write",
    updates: [UseAgentUpdate.OnStateChanged],
  });

  const state = (agent.state ?? {}) as Partial<RWAgentState>;
  const notes = state.notes ?? [];
  const preferences = state.preferences ?? DEFAULT_PREFERENCES;

  // WRITE: every edit in the sidebar goes straight into agent state.
  // On the agent's next turn, `PreferencesInjectorMiddleware` reads this
  // back out of state and adds it to the system prompt — so the UI's
  // writes visibly steer the model.
  const handlePreferencesChange = (next: Preferences) => {
    agent.setState({
      preferences: next,
      notes, // preserve what the agent has written
    } as RWAgentState);
  };

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Introduce yourself",
        message:
          "Hi! I'm a backend engineer in Lisbon and I'm evaluating agent frameworks this week.",
      },
      {
        title: "Ask something",
        message: "What should I watch out for when putting an agent in production?",
      },
    ],
    available: "always",
  });

  return (
    <div className="grid h-full grid-cols-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[380px_1fr]">
      <div className="space-y-4">
        <NotesCard
          notes={notes}
          onClear={() =>
            agent.setState({ preferences, notes: [] } as RWAgentState)
          }
        />
        <PreferencesCard
          preferences={preferences}
          onChange={handlePreferencesChange}
        />
      </div>
      <div className="min-h-[28rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <CopilotChat agentId="shared-state-read-write" className="h-full" />
      </div>
    </div>
  );
}
