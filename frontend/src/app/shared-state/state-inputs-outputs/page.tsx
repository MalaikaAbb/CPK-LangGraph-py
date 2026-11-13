import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// Verbatim from the page's "Emitting a state key outside the output schema"
// section (2026-11). Reference only: no released ag-ui-langgraph (checked up
// to 0.0.47; this repo runs 0.0.42) or copilotkit (up to 0.1.96) reads
// `schema_keys` from the agent config, so wiring it would change nothing.
// See README §9 item 32.
const SCHEMA_KEYS = `from copilotkit import LangGraphAGUIAgent

agent = LangGraphAGUIAgent(
    name="sample_agent",
    graph=graph,
    config={"schema_keys": {"output": ["steps"]}},
)`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/state-inputs-outputs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Not all state should cross the wire. Splitting the schema into three —
          an input schema for what you accept from the frontend, an output schema
          for what you return to it, and the overall schema for everything
          including internals — lets you keep large or sensitive slots entirely
          server-side.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Worth stressing because other integrations only manage this by
          convention: here it is <strong>enforced</strong>. LangGraph filters
          against the schemas, so <code>resources</code> is not merely
          &ldquo;not rendered&rdquo; — it never reaches the browser.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Press Ask with the default question"]}
            expect="answer fills in from the agent. question stays undefined in agent.state even though the UI set it. resources stays undefined however much the agent writes to it."
            fail="resources shows a value. The output schema is not being applied — check that compile-time input_schema/output_schema are set on the StateGraph."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/state-inputs-outputs/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/state_inputs_outputs.py" region="agent" />
      </Panel>

      <Panel title="Emitting a key outside the output schema — reference only">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          New on the page: list extra keys under <code>schema_keys</code> in
          the agent&apos;s <code>config</code> and they are emitted alongside
          the output schema&apos;s. Not wired here, because no released{" "}
          <code>ag-ui-langgraph</code> (through 0.0.47) or{" "}
          <code>copilotkit</code> (through 0.1.96) reads that config key: its{" "}
          <code>get_schema_keys</code> still derives keys from the graph&apos;s
          schemas only. Wiring it onto this agent would also contradict the
          route&apos;s main lesson that <code>resources</code> stays hidden.
        </p>
        <CodeBlock code={SCHEMA_KEYS} language="python" />
      </Panel>

      <Callout tone="warn" title="The page's constructor keywords are deprecated">
        <p>
          It writes{" "}
          <code>
            StateGraph(OverallState, input=InputState, output=OutputState)
          </code>
          . Both keywords were renamed in LangGraph 0.5 and warn on 1.2.10:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            LangGraphDeprecatedSinceV05: `input` is deprecated and will be
            removed. Please use `input_schema` instead. Deprecated in LangGraph
            V0.5 to be removed in V2.0.
          </code>
        </p>
        <p className="mt-2">
          The graph here keeps the page&apos;s spelling rather than modernising
          it. Python suppresses <code>DeprecationWarning</code> outside{" "}
          <code>__main__</code>, so it is silent on a normal boot — run the
          backend with{" "}
          <code>python -W default::DeprecationWarning main.py</code> to see it.
          Works today; breaks on LangGraph 2.
        </p>
      </Callout>

      <Callout tone="info" title="The UI owns its inputs">
        <p>
          Because <code>question</code> is on the input schema and not the
          output one, it is write-only from the frontend&apos;s perspective —
          you will never read it back from <code>agent.state</code>. That is
          intended, but it means the UI has to remember what it sent. The demo
          keeps it in React state alongside, which is what the page means by
          &ldquo;the UI is the source of truth for it&rdquo;.
        </p>
      </Callout>
    </>
  );
}
