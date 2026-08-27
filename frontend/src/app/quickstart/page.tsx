import { RouteHeader } from "@/components/route-header";
import { IntelligenceStatus } from "@/components/intelligence-status";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, KeyValue, Panel, TryIt } from "@/components/ui";
import { describeTransport } from "@/lib/runtime-agents";

export default function Page() {
  const transport = describeTransport();

  return (
    <>
      <RouteHeader path="/quickstart" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The bring-your-own-agent path: a hand-rolled <code>StateGraph</code>{" "}
          with one <code>mock_llm</code> node, served over AG-UI and reached by
          the Copilot Runtime. It is the only graph in this repo not built with{" "}
          <code>create_agent</code> — every page after the Quickstart switches to
          that shape, so this route is also the baseline the others depart from.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Can you tell me a joke?",
              "Can you help me understand AI?",
              "What do you think about React?",
            ]}
            expect="Tokens stream into the chat within a second or two."
            fail="An error banner. The agent server is not running, or OPENAI_API_KEY is missing from its environment — the key belongs to the Python process, not the Next one."
          />
        </div>
      </Panel>

      <Panel
        title="Both deployment tabs, implemented"
        description="The doc page splits here into LangSmith and FastAPI. They are not two ways of writing the same thing — they are different servers, reached by different runtime classes."
      >
        <KeyValue
          rows={[
            [
              "Active now",
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
              "Target",
              <code key="c" className="font-mono text-xs">
                {transport.exampleTarget}
              </code>,
            ],
          ]}
        />

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">&nbsp;</th>
                <th className="py-2 pr-4 font-semibold">FastAPI</th>
                <th className="py-2 font-semibold">LangSmith</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                [
                  "Server",
                  "backend/main.py (uvicorn)",
                  "langgraph dev (LangGraph CLI)",
                ],
                [
                  "Mounting",
                  "add_langgraph_fastapi_endpoint per graph",
                  "backend/langgraph.json",
                ],
                [
                  "Runtime class",
                  "LangGraphHttpAgent({ url })",
                  "LangGraphAgent({ deploymentUrl, graphId })",
                ],
                ["Routing by", "URL path", "graphId"],
                [
                  "Checkpointer",
                  "MemorySaver, compiled in",
                  "supplied by the platform",
                ],
                ["Extra key", "none", "LANGSMITH_API_KEY"],
              ].map(([label, a, b]) => (
                <tr
                  key={label}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    {label}
                  </td>
                  <td className="py-2 pr-4">
                    <code className="text-xs">{a}</code>
                  </td>
                  <td className="py-2">
                    <code className="text-xs">{b}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Everything else in the repo is transport-agnostic. The only place a
          graph module notices is <code>_shared.checkpointer()</code>, because a
          graph deployed to LangGraph Platform must not bring its own.
        </p>
      </Panel>

      <Panel
        title="Intelligence, live"
        description="Read from this checkout's own configuration at render time — not a description of it."
      >
        <IntelligenceStatus />
      </Panel>

      <Callout tone="warn" title="The Quickstart moved to the v2 runtime">
        <p>
          Three things changed when the doc switched surfaces, and all three are
          load-bearing:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            The import is <code>@copilotkit/runtime/v2</code>, not{" "}
            <code>@copilotkit/runtime</code>. There is no{" "}
            <code>serviceAdapter</code> on this surface at all —{" "}
            <code>ExperimentalEmptyAdapter</code> belonged to the v1 GraphQL
            runtime and has no counterpart.
          </li>
          <li>
            <code>createCopilotRuntimeHandler</code> returns a plain fetch
            handler rather than a <code>{"{ handleRequest }"}</code> wrapper, so
            the route is just its verb exports.
          </li>
          <li>
            The file moved to{" "}
            <code>api/copilotkit/[[...slug]]/route.ts</code>. The handler serves
            a whole subtree — <code>/info</code>, agent runs, thread
            list/rename/delete — so the old single-segment route 404s every run
            while <code>/info</code> keeps answering 200. The app looks
            connected and never replies, with no error anywhere.
          </li>
        </ul>
        <p className="mt-2">
          This route exports four verbs rather than the doc&apos;s two.{" "}
          <code>GET</code> serves <code>/info</code> and the thread list,{" "}
          <code>POST</code> runs agents, and <code>PATCH</code>/
          <code>DELETE</code> are how threads are renamed, archived and deleted
          — which the three{" "}
          <a
            href="/prebuilt-components/copilot-threads-drawer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Rich Threads
          </a>{" "}
          routes need. The old route also hand-wrote a <code>GET</code>{" "}
          returning the transport description; that is gone, because the handler
          owns <code>GET</code> now. Nothing was reading it — the status, home
          and Quickstart pages all call <code>describeTransport()</code>{" "}
          directly as server components.
        </p>
      </Callout>

      <Panel
        title="The runtime route, and the shared piece behind it"
        description="Read from this repo, so they can be diffed against the doc's sample directly."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit/[[...slug]]/route.ts" },
            { file: "frontend/src/lib/copilot-runtime.ts" },
          ]}
          note={
            <>
              Intelligence, the license token and <code>identifyUser</code> live
              in the shared file rather than in the route, because all three
              runtimes in this harness — main, voice and declarative-gen-ui —
              have to agree on the mode and on who the user is. Otherwise
              threads created through one endpoint would be invisible to
              another.
            </>
          }
        />
      </Panel>

      <Callout tone="info" title="Two credentials, two different jobs">
        <p>
          <code>INTELLIGENCE_API_KEY</code> puts the runtime in Intelligence
          mode — that is what makes threads persist and the thread endpoints
          return real rows. A license is separate:{" "}
          <code>COPILOTKIT_LICENSE_TOKEN</code> on the runtime, or{" "}
          <code>NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY</code> on the provider
          (what the Threads Drawer doc&apos;s own sample passes). Client-side
          feature UIs gate on the license, not on the key — so a runtime can
          serve threads perfectly while every drawer still shows an Upgrade
          button.
        </p>
        <p className="mt-2">
          Neither is required to chat. Without them the runtime falls back to
          SSE with an in-memory runner, which is why this harness stays runnable
          with only an OpenAI key and a LangGraph server.
        </p>
      </Callout>

      <Panel title="The graph">
        <SourceCode
          file="backend/src/graphs/quickstart.py"
          region="agent"
        />
      </Panel>

      <Panel title="The transport switch">
        <SourceCode file="frontend/src/lib/runtime-agents.ts" />
      </Panel>

      <Panel title="Serving it — FastAPI">
        <SourceCode file="backend/main.py" region="mount" />
      </Panel>

      <Panel title="Serving it — LangSmith">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Generated from the same registry, so the two transports can never
          disagree about which graphs exist. Regenerate with{" "}
          <code>python -m src.graphs.registry</code>.
        </p>
        <SourceCode file="backend/langgraph.json" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/quickstart/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
