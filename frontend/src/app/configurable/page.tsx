import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/configurable" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          LangGraph invokes every graph with a <code>config</code> argument
          carrying a <code>configurable</code> dict, and CopilotKit forwards
          into it from the frontend via{" "}
          <code>forwardedProps.config.configurable</code>. This is the channel
          for per-run execution parameters — auth tokens, session metadata,
          tenant ids.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The distinction from state is the point: <code>configurable</code> does
          not persist, the agent cannot write it back, and it never shows up in{" "}
          <code>agent.state</code>. If you want the UI to observe a value
          afterwards, it belongs in state instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What auth token are you running with?"]}
            expect="Both keys show “arrived” in the left panel, and the agent can name the token it was given for this run."
            fail="Both absent. forwardedProps never reached the graph — check that runAgent is passing config.configurable, not config directly."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/configurable/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/configurable.py" region="agent" />
      </Panel>

      <Panel title="The schema">
        <SourceCode file="backend/src/graphs/configurable.py" region="schema" />
      </Panel>

      <Callout
        tone="warn"
        title="The page's filtering claim does not hold — and the route proves it"
      >
        <p>
          It states that &ldquo;any item passed to
          &lsquo;configurables&rsquo; which is not included in the schema, will
          be filtered out&rdquo;. Against LangGraph 1.2.10 that is not true.
          The demo forwards <code>authToken</code> (declared in{" "}
          <code>ConfigSchema</code>) and <code>undeclaredKey</code> (not
          declared) side by side, and <strong>both arrive</strong> fully
          readable in <code>config[&apos;configurable&apos;]</code>.
        </p>
        <p className="mt-2">
          This matters beyond tidiness: if you were relying on the schema to
          strip anything sensitive before it reached a node, it is not doing
          that. Treat <code>configurable</code> as unfiltered and validate what
          you care about yourself. The schema is a typing and introspection aid.
        </p>
      </Callout>

      <Callout tone="warn" title="config_schema= is deprecated">
        <p>
          The page writes{" "}
          <code>StateGraph(AgentState, config_schema=ConfigSchema)</code>, which
          warns on 1.2.10:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            LangGraphDeprecatedSinceV10: `config_schema` is deprecated and will
            be removed. Please use `context_schema` instead.
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

      <Callout tone="warn" title="Never call runAgent in a component body">
        <p>
          The page calls this out and it is worth repeating because the failure
          is confusing: a bare <code>runAgent()</code> during render fires on
          every render and produces{" "}
          <code>thread is already processing</code>. Use a{" "}
          <code>useEffect</code> with an empty dependency array to start once, or
          call it from an event handler.
        </p>
      </Callout>

      <Callout tone="info" title="For real authentication">
        <p>
          The page points at a dedicated Authentication guide for LangGraph
          Platform and self-hosted patterns. The demo token here is a literal
          string in client code — fine for showing the mechanism, wrong for
          anything real.
        </p>
      </Callout>
    </>
  );
}
