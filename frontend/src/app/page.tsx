import Link from "next/link";

import { StatusBadge } from "@/components/route-header";
import { Callout, KeyValue, Panel } from "@/components/ui";
import { AGENT_IDS } from "@/lib/agents";
import { DOCS_ROOT, DOC_SYNC_DATE, NAV } from "@/lib/nav-config";
import { describeTransport } from "@/lib/runtime-agents";

export default function Page() {
  const transport = describeTransport();
  const routeCount = NAV.flatMap((g) => g.routes).length;

  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          CopilotKit + LangGraph (Python) Test Suite
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          A navigable test harness where every doc page under{" "}
          <a
            href={DOCS_ROOT}
            target="_blank"
            rel="noreferrer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            docs.copilotkit.ai/langgraph-python
          </a>{" "}
          is a route that actually runs the thing it describes.
        </p>
        <div className="mt-4">
          <KeyValue
            rows={[
              ["Doc sync", DOC_SYNC_DATE],
              ["Routes", `${routeCount}`],
              ["Graphs", `${AGENT_IDS.length}`],
              [
                "Active transport",
                <code key="t" className="font-mono text-xs">
                  {transport.transport}
                </code>,
              ],
            ]}
          />
        </div>
      </header>


      <Panel
        title="Both deployment tabs are real"
        description="The Quickstart documents two ways to serve a LangGraph agent. This repo implements both and switches between them with one variable."
      >
        <KeyValue
          rows={[
            [
              "Transport",
              <code key="a" className="font-mono text-xs">
                {transport.transport}
              </code>,
            ],
            [
              "Runtime class",
              <code key="b" className="font-mono text-xs">
                {transport.agentClass}
              </code>,
            ],
            [
              "Deployment URL",
              <code key="c" className="font-mono text-xs">
                {transport.deploymentUrl}
              </code>,
            ],
            [
              "Resolves to",
              <code key="d" className="font-mono text-xs">
                {transport.exampleTarget}
              </code>,
            ],
            [
              "LangSmith key",
              transport.requiresLangsmithKey
                ? transport.langsmithKeyPresent
                  ? "present"
                  : "missing — set LANGSMITH_API_KEY"
                : "not needed on this transport",
            ],
          ]}
        />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Set <code>LANGGRAPH_TRANSPORT</code> in{" "}
          <code>frontend/.env.local</code> and <code>backend/.env</code>, then
          restart both processes. The graphs are identical either way — only the
          checkpointer and the serving layer change.
        </p>
      </Panel>

      <Panel title="The routes">
        <div className="space-y-6">
          {NAV.map((group) => (
            <div key={group.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {group.title}
              </h3>
              <ul className="mt-2 space-y-1.5">
                {group.routes.map((route) => (
                  <li
                    key={`${group.title}-${route.path}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
                  >
                    <Link
                      href={route.path}
                      className="font-medium text-[var(--accent)] underline underline-offset-4"
                    >
                      {route.title}
                    </Link>
                    <code className="font-mono text-xs text-slate-500 dark:text-slate-400">
                      {route.path}
                    </code>
                    <StatusBadge status={route.status} />
                    {route.agentId && (
                      <code className="font-mono text-xs text-slate-400 dark:text-slate-500">
                        {route.agentId}
                      </code>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      {/* <Callout tone="info" title="What the docs left out">
        <p>
          Where a page defined an agent, tool or middleware, it is reproduced
          here. Where a page <em>named</em> something it never printed — the
          supervisor in Sub-Agents, the A2UI schema JSON, three of the four
          tool-rendering tools — README §9 lists exactly what was filled in and
          why. Two places where the docs are simply wrong against the installed
          packages are flagged on their own routes.
        </p>
      </Callout> */}
    </>
  );
}
