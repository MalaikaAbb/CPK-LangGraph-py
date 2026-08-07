"use client";

import {
  CopilotPopup,
  useAgentContext,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `readonly-state-agent-context` cell.
 *
 * Three `useAgentContext` calls, one per value, each with a `description`. The
 * description is not decoration — it is the only label the agent gets, so the
 * page's advice to "treat it like a parameter docstring" is the practical rule.
 *
 * Nothing here has a setter and the agent has no tool that could write any of
 * it back. That asymmetry is the whole feature: these are inputs, not fields.
 */
const ACTIVITIES = [
  "Opened the Q3 revenue dashboard",
  "Exported the churn report to CSV",
  "Commented on the pricing proposal",
  "Archived 12 resolved support tickets",
];

export default function Page() {
  return (
    <DemoFrame
      parentPath="/shared-state/agent-readonly"
      subtitle="graph: readonly-state-agent-context"
    >
      <DemoContent />
    </DemoFrame>
  );
}

function DemoContent() {
  const [userName, setUserName] = useState("Atai");
  const [userTimezone, setUserTimezone] = useState("America/Los_Angeles");
  const [recentActivity, setRecentActivity] = useState<string[]>([
    ACTIVITIES[0],
    ACTIVITIES[2],
  ]);

  useAgentContext({
    description: "The currently logged-in user's display name",
    value: userName,
  });
  useAgentContext({
    description: "The user's IANA timezone (used when mentioning times)",
    value: userTimezone,
  });
  useAgentContext({
    description: "The user's recent activity in the app, newest first",
    value: recentActivity,
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Who am I?",
        message: "Who am I and what have I been doing in the app?",
      },
      {
        title: "Try to change it",
        message: "Please change my name to Bob and my timezone to UTC.",
      },
    ],
    available: "always",
  });

  return (
    <div className="h-full overflow-y-auto p-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        UI-owned context
      </h2>
      <p className="mt-1 max-w-prose text-sm text-slate-600 dark:text-slate-400">
        Everything below is published to the agent one-way. Change it and ask
        again — the answer follows. Ask the agent to change it and it cannot.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="User name" description="The logged-in user's display name">
          <input
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
        </Field>

        <Field label="Timezone" description="IANA zone used when mentioning times">
          <select
            value={userTimezone}
            onChange={(e) => setUserTimezone(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            {[
              "America/Los_Angeles",
              "America/New_York",
              "Europe/London",
              "Asia/Karachi",
              "Asia/Tokyo",
            ].map((tz) => (
              <option key={tz}>{tz}</option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Recent activity" description="Newest first">
          <ul className="space-y-1.5">
            {ACTIVITIES.map((activity) => {
              const on = recentActivity.includes(activity);
              return (
                <li key={activity}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setRecentActivity((prev) =>
                          on
                            ? prev.filter((a) => a !== activity)
                            : [activity, ...prev],
                        )
                      }
                    />
                    {activity}
                  </label>
                </li>
              );
            })}
          </ul>
        </Field>
      </div>

      <CopilotPopup
        agentId="readonly-state-agent-context"
        defaultOpen={true}
        labels={{ chatInputPlaceholder: "Ask about your context..." }}
      />
    </div>
  );
}

function Field({
  label,
  description,
  children,
}: {
  label: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {label}
      </p>
      <p className="mb-2 text-xs text-slate-500">{description}</p>
      {children}
    </div>
  );
}
