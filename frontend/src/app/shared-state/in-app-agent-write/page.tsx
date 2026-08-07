import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-write" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The write half: <code>agent.setState</code> from a UI event handler,
          in both of the forms the page shows. The plain version writes state and
          stops — the value is picked up &ldquo;next time the agent runs&rdquo;.
          The Advanced Usage version follows it with{" "}
          <code>agent.runAgent()</code> to re-run immediately rather than waiting
          for the user&apos;s next message.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send “Tell me a joke”, then press Toggle Language, then ask again",
              "Then try Toggle + re-run instead",
            ]}
            expect="After Toggle, the language readout flips but nothing else happens until you send a message — then the joke comes back in the new language. Toggle + re-run makes the agent reply immediately."
            fail="Toggle changes the readout but the following reply is still in the old language. State was written after the run had already started."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-write/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/shared_state_language.py" region="agent" />
      </Panel>

     
    </>
  );
}
