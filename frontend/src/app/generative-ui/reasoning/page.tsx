import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/reasoning" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Replacing the reasoning card outright. The page&apos;s framing is
          worth keeping: reasoning is not a custom-renderer plumb-in but a
          dedicated message type on the chat view, so you override it through
          the <code>messageView.reasoningMessage</code> slot rather than by
          registering a tool renderer.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The difference from{" "}
          <a
            href="/custom-look-and-feel/reasoning-messages"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Reasoning Messages
          </a>{" "}
          is only the shape of what you pass to that one prop: an{" "}
          <strong>object</strong> replaces sub-slots of the built-in card, a{" "}
          <strong>component</strong> replaces the card entirely. This route does
          the latter, so the collapsible chrome disappears completely.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Three switches downstairs control three bulbs upstairs. You may go up only once. How do you tell which switch controls which bulb? Reason it through.",
            ]}
            expect="An always-open banner tagged “Reasoning” above the answer — no card, no chevron, nothing to expand."
            fail="The default collapsible card. The slot got an object rather than a component. Or no block at all — the model did not deliberate on that prompt."
          />
        </div>
      </Panel>

      <Panel title="The custom renderer">
        <SourceCode file="frontend/src/app/generative-ui/reasoning/reasoning-block.tsx" />
      </Panel>

      <Panel title="Wiring it up">
        <SourceCode file="frontend/src/app/generative-ui/reasoning/demo-chat/page.tsx" />
      </Panel>

      <Panel title="What the component receives">
        <dl className="space-y-2 text-sm">
          {[
            ["message", "The ReasoningMessage object — .content holds the text."],
            ["messages", "All messages in the conversation."],
            ["isRunning", "Whether the agent is currently running."],
          ].map(([n, d]) => (
            <div key={n} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-28 dark:text-slate-100">
                {n}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{d}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Note what is <em>not</em> in that list: there is no{" "}
          <code>isStreaming</code>. The component has to derive it — a block is
          still streaming only if the run is open <em>and</em> this is the
          trailing message. That derivation is the first thing{" "}
          <code>ReasoningBlock</code> does.
        </p>
      </Panel>

    
    </>
  );
}
