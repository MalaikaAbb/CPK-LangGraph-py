import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/subgraphs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A subgraph is just a compiled graph used as a node inside another
          graph — encapsulation for LangGraph. The CopilotKit-specific claim is
          narrow and worth testing on its own: <strong>state written inside a
          nested graph streams to the client in real time</strong>, exactly as if
          a top-level node had written it, with no extra wiring on either side.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Tell me about the history of the shipping container."]}
            expect="The stage chip moves planning → gathered → assessed → done, and findings appear in two waves while the subgraph runs — before the summary arrives in the chat."
            fail="All findings appear at once at the very end, together with the summary. Nothing streamed out of the nested graph."
          />
        </div>
      </Panel>

      <Panel title="The graph shape">
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-100">
          {`parent:  START → plan → [ research ] → summarize → END
                            │
                            └─ subgraph: gather → assess → END

\`findings\` is written only by gather and assess — both inside the subgraph.`}
        </pre>
      </Panel>

      <Panel title="The subgraph">
        <SourceCode file="backend/src/graphs/subgraphs.py" region="subgraph" />
      </Panel>

      <Panel title="The parent">
        <SourceCode file="backend/src/graphs/subgraphs.py" region="parent" />
      </Panel>

      <Panel title="The frontend — the page's entire snippet">
        <SourceCode file="frontend/src/app/subgraphs/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="This page publishes no agent code at all">
        <p>
          It links out to the CopilotKit Feature Viewer for the example and
          prints exactly one snippet — the four-line <code>useAgent</code> call.
          There is no graph, no subgraph, no state schema anywhere on the page.
          So the backend here is entirely this repo&apos;s, built to demonstrate
          the one claim the page does make. That is why the route is marked
          Partial: the frontend is the doc&apos;s, the backend is an
          interpretation of it. See README §9.
        </p>
      </Callout>

      <Callout tone="info" title="Two details the shape depends on">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            <strong>Shared state schema.</strong> Parent and subgraph use the
            same <code>AgentState</code>, which is what lets the nested writes
            land in one place the UI is already watching.
          </li>
          <li>
            <strong>The subgraph compiles without a checkpointer.</strong> It
            inherits the parent&apos;s. Giving a subgraph its own is the usual
            way to get confusing persistence behaviour.
          </li>
        </ul>
      </Callout>

      <Callout tone="info" title="interrupt() works from inside a subgraph too">
        <p>
          The page notes this in passing. It is not demonstrated here to keep
          this route about streaming alone — the interrupt mechanics, including
          the node-replay caveat, are on{" "}
          <a
            href="/human-in-the-loop/interrupt-flow"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Interrupts
          </a>
          .
        </p>
      </Callout>
    </>
  );
}
