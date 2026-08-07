import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/predictive-state-updates" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A LangGraph agent&apos;s state only changes at node transitions, but a
          single node can run for many seconds and contain sub-steps the user
          would want to see. Predictive state updates push those intermediate
          values to the UI before the node returns.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The doc page nests two choices — <code>agent-type</code>, then{" "}
          <code>state-emission</code> inside the custom-graph branch — and{" "}
          <strong>all three leaves are live here</strong>, switchable on the
          demo, because they are genuinely different mechanisms rather than
          three spellings of one.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs leading-relaxed text-slate-100">
          {`Custom graph ─┬─ Manual emission   copilotkit_emit_state, by hand
              └─ Tool emission     copilotkit_customize_config mapping
Prebuilt agent ─  StateStreamingMiddleware(StateItem(…))`}
        </pre>
        <div className="mt-4">
          <TryIt
            prompts={["Plan a three-course dinner party for six people."]}
            expect="Steps land one at a time in the progress panel while the agent is still working, then the final answer arrives."
            fail="All the steps appear at once at the very end. Nothing was emitted mid-node — the prediction path is not wired."
          />
        </div>
      </Panel>

      <Panel title="Custom graph → Manual emission: emit by hand">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          You own the node, so you decide when the UI should see something.{" "}
          <code>copilotkit_emit_state(config, state)</code> pushes the current
          state out mid-execution. This is the only option when progress is not
          tied to a tool call at all — a loop, a batch, an external poll.
        </p>
        <SourceCode
          file="backend/src/graphs/predictive_state_manual_emission.py"
          region="node"
        />
      </Panel>

      <Panel title="Custom graph → Tool emission: map a streaming argument">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Still your node, but nothing is emitted by hand.{" "}
          <code>copilotkit_customize_config</code> declares one{" "}
          <code>emit_intermediate_state</code> mapping and CopilotKit forwards
          the model&apos;s partially-generated <code>steps</code> argument into{" "}
          <code>observed_steps</code> as the tool call streams. Reach for this
          when the progress you want to show <em>is</em> what the model is
          writing.
        </p>
        <SourceCode
          file="backend/src/graphs/predictive_state_tool_emission.py"
          region="node"
        />
      </Panel>

      <Panel title="Prebuilt agent: declare a mapping">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          <code>create_agent</code> owns the loop, so there is no node of yours
          to call an emit function from. Instead you declare a{" "}
          <code>StateItem</code> mapping and the middleware emits as the model
          streams that tool argument — the same mechanism as{" "}
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Streaming
          </a>
          , pointed at a list instead of a string.
        </p>
        <SourceCode
          file="backend/src/graphs/predictive_state_prebuilt.py"
          region="agent"
        />
      </Panel>

      <Panel title="The frontend — identical for both">
        <SourceCode file="frontend/src/app/shared-state/predictive-state-updates/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="Emissions are predictions, not commitments">
        <p>
          The page states this plainly and it is the failure mode people hit:
          when a node finishes, <strong>its returned state is the single source
          of truth</strong>. Anything you emitted mid-node but did not include in
          the return value is overwritten when the node completes. That is why
          the custom-graph node below both emits <code>observed_steps</code> in
          its loop <em>and</em> returns it at the end — dropping the second half
          makes the steps appear and then vanish.
        </p>
      </Callout>

      <Callout
        tone="info"
        title="Where the prediction actually happens — it is not a state event"
      >
        <p>
          Worth knowing before you go looking for it in the network tab: on the
          tool-emission path the backend emits{" "}
          <strong>no intermediate state snapshots at all</strong>. Capturing a
          real run shows one <code>PredictState</code> custom event advertising
          the mapping, then ~120 <code>TOOL_CALL_ARGS</code> chunks, then a
          single <code>STATE_SNAPSHOT</code> at the end:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            {
              '{"name":"PredictState","value":[{"state_key":"observed_steps","tool":"step_progress_tool","tool_argument":"steps"}]}'
            }
          </code>
        </p>
        <p className="mt-2">
          The live filling is done <em>client-side</em>:{" "}
          <code>usePredictStateSubscription</code> reads that mapping,
          partial-JSON-parses the streaming tool arguments, and writes them into{" "}
          <code>observed_steps</code>. The final snapshot then overwrites the
          prediction with the authoritative value. Same division of labour as{" "}
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Streaming
          </a>
          , which is why the argument name and the state key have to match there
          too.
        </p>
      </Callout>

      <Callout tone="info" title="An empty tool body is not a stub">
        <p>
          <code>step_progress_tool</code> has no implementation, in the docs and
          here. It does not need one: the tool exists so the model has something
          to <em>call</em>, and the middleware harvests the streaming{" "}
          <code>steps</code> argument out of the call itself. The body would only
          run after the arguments were complete, which is exactly too late to be
          useful.
        </p>
      </Callout>
    </>
  );
}
