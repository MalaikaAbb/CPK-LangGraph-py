import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/reasoning-messages" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Reasoning is not a tool call painted with a custom renderer — it is a
          dedicated message type on the chat view. When{" "}
          <code>REASONING_MESSAGE_*</code> events arrive, CopilotKit renders a
          collapsible card with no configuration at all. The card is built from
          three sub-components, and each is a slot: <code>header</code>,{" "}
          <code>contentView</code>, <code>toggle</code>. The demo toggles
          between the built-in card and two replaced sub-slots.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost? Show your working.",
            ]}
            expect="A reasoning card streams in above the answer, labelled “Thinking…”, then collapses to “Thought for N seconds”. Switch to custom sub-slots and the same card comes back with a 🧠/💡 header and mono content."
            fail="No card at all. Either the model did not deliberate on that prompt — ask something harder — or the agent is not on a reasoning model."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/reasoning-messages/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The two replaced sub-slots">
        <SourceCode file="frontend/src/app/custom-look-and-feel/reasoning-messages/reasoning-slots.tsx" />
      </Panel>

      <Panel title="Sub-slot props">
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
              header
            </p>
            <dl className="mt-1 space-y-1">
              {[
                ["isOpen", "Whether the content panel is currently expanded"],
                [
                  "label",
                  "“Thinking…” while streaming, “Thought for X seconds” after",
                ],
                ["hasContent", "Whether any reasoning text has been received"],
                ["isStreaming", "Whether reasoning is actively streaming"],
                ["onClick", "Toggle handler — only present when hasContent"],
              ].map(([n, d]) => (
                <div key={n} className="flex gap-3">
                  <dt className="w-28 shrink-0 font-mono text-xs text-slate-500">
                    {n}
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-400">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <p className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
              contentView
            </p>
            <dl className="mt-1 space-y-1">
              {[
                ["isStreaming", "Whether reasoning tokens are still arriving"],
                ["hasContent", "Whether any reasoning text has been received"],
                ["children", "The raw reasoning text"],
              ].map(([n, d]) => (
                <div key={n} className="flex gap-3">
                  <dt className="w-28 shrink-0 font-mono text-xs text-slate-500">
                    {n}
                  </dt>
                  <dd className="text-slate-600 dark:text-slate-400">{d}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Panel>

      <Callout
        tone="warn"
        title="No doc page puts its demo agent on a model that can do this"
      >
        <p>
          Both reasoning pages describe <code>REASONING_MESSAGE_*</code> events
          and name their demo agents, but every Python snippet in the docs builds
          on <code>gpt-5.4</code> — a model OpenAI does not publish, and not a
          reasoning model in any case. Reasoning does not arrive on its own; the
          model has to emit it. These pages do name the models that do (o1, o3,
          o4-mini), so this repo puts both reasoning graphs on{" "}
          <code>o4-mini</code>. That is the only reason this route is marked
          Partial — the slot mechanism itself is exactly as documented.
        </p>
      </Callout>
    </>
  );
}
