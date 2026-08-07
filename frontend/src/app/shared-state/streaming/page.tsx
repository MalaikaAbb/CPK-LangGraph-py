import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/streaming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          By default a LangGraph agent&apos;s state only updates{" "}
          <em>between</em> checkpoints, so a tool that writes a long document
          looks like one burst at the end. State streaming forwards a specific
          tool <em>argument</em> into a state key while the model is still
          generating it, so the UI can watch the answer assemble.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Write a short essay on why agent-native UIs beat chatbots."]}
            expect="The document pane fills a few words at a time with a LIVE badge, and the text never appears as a chat message."
            fail="One jump at the end. The mapping is not in effect — check that the tool's argument name and the state_key match exactly."
          />
        </div>
      </Panel>

      <Panel title="The backend mapping">
        <SourceCode file="backend/src/graphs/shared_state_streaming.py" region="agent" />
      </Panel>

      <Panel title="The frontend subscription">
        <SourceCode file="frontend/src/app/shared-state/streaming/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The document pane">
        <SourceCode file="frontend/src/app/shared-state/document-canvas.tsx" />
      </Panel>

    
    </>
  );
}
