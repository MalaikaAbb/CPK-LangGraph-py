"use client";

export type SubAgentName = "research_agent" | "writing_agent" | "critique_agent";

export type Delegation = {
  id: string;
  sub_agent: SubAgentName;
  task: string;
  status: string;
  result: string;
};

const SUB_AGENT_STYLE: Record<
  SubAgentName,
  { label: string; emoji: string; color: string }
> = {
  research_agent: {
    label: "Researcher",
    emoji: "🔎",
    color:
      "border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-100",
  },
  writing_agent: {
    label: "Writer",
    emoji: "✍️",
    color:
      "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-100",
  },
  critique_agent: {
    label: "Critic",
    emoji: "🧐",
    color:
      "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100",
  },
};

// The three roles the supervisor can call. Rendered as always-visible chips
// whether or not it has delegated yet, so you can see which sub-agents exist
// and which have fired at a glance.
const INDICATOR_ROLES: ReadonlyArray<{
  role: "researcher" | "writer" | "critic";
  subAgent: SubAgentName;
}> = [
  { role: "researcher", subAgent: "research_agent" },
  { role: "writer", subAgent: "writing_agent" },
  { role: "critic", subAgent: "critique_agent" },
];

/**
 * Live delegation log — renders the `delegations` slot of agent state.
 *
 * Each entry is one sub-agent invocation. The list grows in real time as the
 * supervisor fans work out to its children, which is what turns an otherwise
 * long opaque pause into something legible.
 */
export function DelegationLog({
  delegations,
  isRunning,
}: {
  delegations: Delegation[];
  isRunning: boolean;
}) {
  const calledRoles = new Set<SubAgentName>(delegations.map((d) => d.sub_agent));

  return (
    <div
      data-testid="delegation-log"
      className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Sub-agent delegations
          </span>
          {isRunning && (
            <span
              data-testid="supervisor-running"
              className="inline-flex items-center gap-1.5 rounded-full border border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-100"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-600" />
              Supervisor running
            </span>
          )}
        </div>
        <span data-testid="delegation-count" className="font-mono text-xs text-slate-400">
          {delegations.length} calls
        </span>
      </div>

      <div
        data-testid="subagent-indicators"
        className="flex items-center gap-2 border-b border-slate-200 px-6 py-2 dark:border-slate-800"
      >
        {INDICATOR_ROLES.map(({ role, subAgent }) => {
          const style = SUB_AGENT_STYLE[subAgent];
          const fired = calledRoles.has(subAgent);
          return (
            <span
              key={role}
              data-testid={`subagent-indicator-${role}`}
              data-role={role}
              data-fired={fired ? "true" : "false"}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${style.color} ${
                fired ? "" : "opacity-50"
              }`}
            >
              <span aria-hidden>{style.emoji}</span>
              <span>{style.label}</span>
            </span>
          );
        })}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {delegations.length === 0 ? (
          <p className="py-16 text-center text-sm italic text-slate-400">
            Ask the supervisor to complete a task. Every sub-agent it calls will
            appear here.
          </p>
        ) : (
          delegations.map((d, idx) => {
            const style = SUB_AGENT_STYLE[d.sub_agent] ?? {
              label: d.sub_agent,
              emoji: "•",
              color: "border-slate-300 text-slate-700",
            };
            return (
              <div
                key={d.id}
                data-testid="delegation-entry"
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-400">
                      #{idx + 1}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${style.color}`}
                    >
                      <span>{style.emoji}</span>
                      <span>{style.label}</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:text-emerald-400">
                    {d.status}
                  </span>
                </div>
                <div className="mb-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    Task:{" "}
                  </span>
                  {d.task}
                </div>
                <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {d.result}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
