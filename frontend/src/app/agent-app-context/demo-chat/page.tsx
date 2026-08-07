"use client";

import {
  CopilotSidebar,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's Readables cell: sharing live app state with the agent.
 *
 * The page's own example is a `colleagues` array, reproduced below with the
 * same description string it uses for the manual lookup —
 * "The current user's colleagues" — so the backend's `find_context_entry`
 * has something real to match on.
 *
 * Two more entries are added so the "context follows the UI" claim is
 * observable: which page you are notionally on, and which colleague is
 * selected. Change either and the agent's next answer follows.
 */
type Colleague = { id: number; name: string; role: string };

const COLLEAGUES: Colleague[] = [
  { id: 1, name: "John Doe", role: "Developer" },
  { id: 2, name: "Jane Smith", role: "Designer" },
  { id: 3, name: "Bob Wilson", role: "Product Manager" },
];

const PAGES = ["Inbox", "Team directory", "Billing"];

export default function Page() {
  return (
    <DemoFrame
      parentPath="/agent-app-context"
      subtitle="graph: agent-app-context"
    >
      <YourComponent />
    </DemoFrame>
  );
}

function YourComponent() {
  const [colleagues] = useState<Colleague[]>(COLLEAGUES);
  const [currentPage, setCurrentPage] = useState(PAGES[1]);
  const [selectedId, setSelectedId] = useState<number | null>(2);

  const selected = colleagues.find((c) => c.id === selectedId) ?? null;

  // Share context with the agent
  useAgentContext({
    description: "The current user's colleagues",
    value: colleagues,
  });
  useAgentContext({
    description: "The page the user is currently looking at",
    value: currentPage,
  });
  useAgentContext({
    description: "The colleague the user has selected, if any",
    value: selected,
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Who's on the team?",
        message: "Who are my colleagues and what do they each do?",
      },
      {
        title: "Draft an email",
        message: "Draft a short email to the person I have selected.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full">
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Team directory
        </h2>
        <p className="mt-1 max-w-prose text-sm text-slate-600 dark:text-slate-400">
          Everything on this page is published to the agent as context. Select a
          different colleague or switch pages, then ask again — the answer
          follows without you retyping anything.
        </p>

        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Current page
          </p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {PAGES.map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  currentPage === p
                    ? "bg-[var(--accent)] text-white"
                    : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {colleagues.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setSelectedId(c.id === selectedId ? null : c.id)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  c.id === selectedId
                    ? "border-[var(--accent)] bg-sky-50 dark:bg-sky-950/40"
                    : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">{c.role}</p>
              </button>
            </li>
          ))}
        </ul>
      </main>

      <CopilotSidebar agentId="agent-app-context" defaultOpen={true} />
    </div>
  );
}
