import Link from "next/link";

import { StatusBadge } from "@/components/route-header";
import { Callout, KeyValue, Panel } from "@/components/ui";
import { AGENT_IDS, LANGGRAPH_URL } from "@/lib/agents";
import { DOC_SYNC_DATE, NAV, docUrl } from "@/lib/nav-config";
import { describeTransport } from "@/lib/runtime-agents";

/**
 * The living QA record, plus a live cross-check against the running backend.
 *
 * Two lists have to agree for any route to work: `AGENT_IDS` here and
 * `REGISTRY` in `backend/src/graphs/registry.py`. This page fetches the
 * server's own `/health` and reports drift in either direction, so a route
 * failing because of a typo'd id is diagnosable in one place.
 */
export const dynamic = "force-dynamic";

type Health = { agents?: string[]; count?: number; transport?: string };

async function fetchHealth(): Promise<
  { ok: true; health: Health } | { ok: false; error: string }
> {
  try {
    const res = await fetch(`${LANGGRAPH_URL}/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return { ok: true, health: (await res.json()) as Health };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export default async function Page() {
  const transport = describeTransport();
  const result = await fetchHealth();

  const serverAgents = result.ok ? (result.health.agents ?? []) : [];
  const missingOnServer = result.ok
    ? AGENT_IDS.filter((id) => !serverAgents.includes(id))
    : [];
  const missingOnFrontend = result.ok
    ? serverAgents.filter((id) => !(AGENT_IDS as readonly string[]).includes(id))
    : [];

  const routes = NAV.flatMap((g) => g.routes.map((r) => ({ ...r, group: g.title })));
  const counts = routes.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <header className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Status
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-400">
          Every route, its doc page and its graph — plus a live cross-check
          against the running agent server.
        </p>
      </header>

      <Panel title="Registry cross-check">
        <KeyValue
          rows={[
            ["Doc sync", DOC_SYNC_DATE],
            [
              "Transport",
              <code key="t" className="font-mono text-xs">
                {transport.transport} · {transport.agentClass}
              </code>,
            ],
            [
              "Backend",
              <code key="u" className="font-mono text-xs">
                {LANGGRAPH_URL}
              </code>,
            ],
            ["Frontend agent ids", `${AGENT_IDS.length}`],
            [
              "Server reports",
              result.ok ? (
                `${result.health.count ?? serverAgents.length}`
              ) : (
                <span className="text-rose-600 dark:text-rose-400">
                  unreachable — {result.error}
                </span>
              ),
            ],
          ]}
        />

        {result.ok && missingOnServer.length === 0 && missingOnFrontend.length === 0 && (
          <div className="mt-4">
            <Callout tone="success" title="In sync">
              Every id the frontend can address is mounted on the server, and
              nothing is mounted that the frontend does not know about.
            </Callout>
          </div>
        )}

        {missingOnServer.length > 0 && (
          <div className="mt-4">
            <Callout tone="warn" title="Registered here but not mounted on the server">
              <code className="font-mono text-xs">
                {missingOnServer.join(", ")}
              </code>
              <p className="mt-1">
                Routes using these ids will error. Add them to{" "}
                <code>backend/src/graphs/registry.py</code>.
              </p>
            </Callout>
          </div>
        )}

        {missingOnFrontend.length > 0 && (
          <div className="mt-4">
            <Callout tone="warn" title="Mounted on the server but unknown here">
              <code className="font-mono text-xs">
                {missingOnFrontend.join(", ")}
              </code>
              <p className="mt-1">
                Harmless, but the runtime will not route to them. Add them to{" "}
                <code>frontend/src/lib/agents.ts</code>.
              </p>
            </Callout>
          </div>
        )}

        {!result.ok && (
          <div className="mt-4">
            <Callout tone="warn" title="Agent server not reachable">
              <p>
                Start it with{" "}
                <code>cd backend &amp;&amp; uv run --env-file .env python main.py</code>{" "}
                (FastAPI) or{" "}
                <code>langgraph dev --port 8123 --no-browser</code> (LangSmith).
                The table below still reflects the recorded status of each
                route.
              </p>
            </Callout>
          </div>
        )}
      </Panel>

      <Panel
        title="Routes"
        description={Object.entries(counts)
          .map(([k, v]) => `${v} ${k}`)
          .join(" · ")}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">Route</th>
                <th className="py-2 pr-4 font-semibold">Doc page</th>
                <th className="py-2 pr-4 font-semibold">Graph</th>
                <th className="py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {routes.map((route) => {
                const mounted =
                  !route.agentId ||
                  !result.ok ||
                  serverAgents.includes(route.agentId);
                return (
                  <tr
                    key={`${route.group}-${route.path}`}
                    className="border-b border-slate-100 align-top dark:border-slate-900"
                  >
                    <td className="py-2 pr-4">
                      <Link
                        href={route.path}
                        className="font-medium text-[var(--accent)] underline underline-offset-4"
                      >
                        {route.title}
                      </Link>
                      <div className="font-mono text-xs text-slate-400">
                        {route.path}
                      </div>
                    </td>
                    <td className="py-2 pr-4">
                      <a
                        href={docUrl(route)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-slate-500 underline underline-offset-4"
                      >
                        {route.docPath}
                      </a>
                    </td>
                    <td className="py-2 pr-4">
                      {route.agentId ? (
                        <code
                          className={`font-mono text-xs ${
                            mounted
                              ? "text-slate-500"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {route.agentId}
                          {!mounted && " ✕"}
                        </code>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      <StatusBadge status={route.status} />
                      {route.statusNote && (
                        <p className="mt-1 max-w-xs text-xs text-slate-500">
                          {route.statusNote}
                        </p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <Callout tone="info" title="What “Working” means here">
        <p>
          Every route typechecks, lints, builds and renders, and the agent
          server boots with all {AGENT_IDS.length} graphs mounted. Individual
          agent <em>behaviours</em> — particularly the two A2UI routes and the
          two reasoning routes, which depend on model cooperation — have not
          each been driven end-to-end against a live OpenAI key. Partial always
          carries a note saying why.
        </p>
      </Callout>
    </>
  );
}
