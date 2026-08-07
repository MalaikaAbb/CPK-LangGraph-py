import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

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
