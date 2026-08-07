import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/in-app-agent-read" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The read half of shared state, on its own. <code>agent.state</code> is
          reactive: whenever the slot changes — here from the UI on the Writing
          route — the hook fires and the panel re-renders. No polling, no
          subscription bookkeeping, no chat involvement.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Ask anything here, then flip the toggle on Writing agent state and ask again",
            ]}
            expect="The readout shows the current slot, and replies come back in whatever language it holds — English first, Spanish after the toggle."
            fail="The readout never changes. chat_node is not returning `language` in its dict, so the slot never travels back to the frontend."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/in-app-agent-read/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/shared_state_language.py" region="agent" />
      </Panel>

      
    </>
  );
}
