import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
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
