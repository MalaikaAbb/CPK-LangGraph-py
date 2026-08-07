import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/css" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Re-skinning the chat without touching a component. Two layers do the
          work: the v2 shadcn design tokens on <code>[data-copilotkit]</code>,
          which every nested component reads automatically, and the{" "}
          <code>.copilotKit*</code> class hooks for structure the tokens do not
          reach. Both live in a sibling <code>theme.css</code> scoped under one
          wrapper class.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Tell me about this theme"]}
            expect="A warm parchment surface, square corners, your messages in JetBrains Mono behind a copper → marker, and assistant replies in a serif face."
            fail="The default blue-and-white chat. The stylesheet is not imported, or the wrapper is missing its .chat-css-demo-scope class."
          />
        </div>
      </Panel>

      <Panel title="The theme">
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/theme.css" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/css/demo-chat/page.tsx" />
      </Panel>
    </>
  );
}
