import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/rendering-in-app" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same agent state as the{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Shared State
          </a>{" "}
          route, rendered as the main view. The point is a negative one:{" "}
          <code>useAgent</code> is not a chat hook. It works in any component
          under the provider, so the canvas and the sidebar are two consumers of
          one agent instance sharing one state object. The sidebar is not
          special.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Add a task to the list, mark it done, and add another",
            ]}
            expect="Cards appear in the main view as the agent takes notes. Clicking one removes it, and the agent's next answer no longer mentions it."
            fail="The agent still cites the removed note. setState wrote a value the next turn did not read."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/rendering-in-app/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="Three things the page warns about">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            <strong>Target the right agent.</strong>{" "}
            <code>useAgent()</code> with no argument resolves to the agent named{" "}
            <code>default</code>, not &ldquo;the one this page uses&rdquo;. Pass{" "}
            <code>{"{ agentId }"}</code> whenever more than one exists — which
            here is always.
          </li>
          <li>
            <strong>Treat state as possibly partial.</strong> Mid-run you will
            see half-filled values. Guard with defaults so a streaming update
            cannot crash the render.
          </li>
          <li>
            <strong>Throttle heavy canvases.</strong>{" "}
            <code>useAgent({"{ throttleMs }"})</code> exists for when a
            token-by-token stream re-renders something expensive.
          </li>
        </ul>
      </Callout>
    </>
  );
}
