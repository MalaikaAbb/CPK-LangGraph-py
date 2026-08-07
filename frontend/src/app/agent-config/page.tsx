import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-config" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A typed settings object the UI owns and the agent obeys — tone,
          expertise, response length. The page is careful about when this is the
          right shape: reach for it when the values are a <em>channel</em> the
          user occasionally tunes. If the values are <em>content</em> the agent
          should write back to, that is{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          instead.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Ask “What is a vector database?” at expertise=beginner",
              "Then switch to expert and ask the identical question",
            ]}
            expect="Visibly different answers — the beginner one defines terms and gives an example, the expert one skips preamble and goes to trade-offs."
            fail="Identical answers. The context entry is not reaching the middleware, or read_config_value is rejecting its shape."
          />
        </div>
      </Panel>

      <Panel title="The UI half">
        <SourceCode file="frontend/src/app/agent-config/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Reading the config">
        <SourceCode file="backend/src/graphs/agent_config.py" region="read-config" />
      </Panel>

      <Panel title="Rebuilding the prompt">
        <SourceCode file="backend/src/graphs/agent_config.py" region="build-prompt" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/agent_config.py" region="agent" />
      </Panel>

      <Callout tone="warn" title="build_system_prompt is called but never defined">
        <p>
          The page&apos;s node calls it on every turn and prints{" "}
          <code>read_config_value</code> in full, but the function that turns
          three fields into actual directives appears nowhere. Its wording here
          is therefore this repo&apos;s — only its job is the page&apos;s. If
          your answers do not differ much between settings, that wording is the
          first thing to make more forceful; vague directives produce vague
          differences. See README §9.
        </p>
      </Callout>

      <Callout tone="info" title="Two framework shapes, one page">
        <p>
          The doc page branches on a <code>agent_config_pattern</code> flag.
          Frameworks whose agent lives behind a runtime — langgraph-python
          included — use the <strong>shared-state</strong> shape shown here:
          publish with <code>useAgentContext</code>, read from context
          server-side. In-process frameworks use the{" "}
          <strong>runtime-properties</strong> shape instead, passing{" "}
          <code>properties</code> on <code>&lt;CopilotKit&gt;</code> and reading{" "}
          <code>input.forwardedProps</code> in an agent factory. Same UX,
          different wiring; only the first applies here.
        </p>
      </Callout>

      <Callout tone="info" title="Why the relay is its own component">
        <p>
          <code>ConfigContextRelay</code> renders <code>null</code> and exists
          only to hold the hook. Keeping <code>useAgentContext</code> out of the
          panel component means the context entry is not re-registered on every
          keystroke or hover — it updates when the config value actually
          changes, which is the identity-stability point the{" "}
          <a
            href="/shared-state/agent-readonly"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            read-only context
          </a>{" "}
          page raises.
        </p>
      </Callout>
    </>
  );
}
