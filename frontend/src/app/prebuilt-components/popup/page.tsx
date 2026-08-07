import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/popup" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotPopup&gt;</code> is the lowest-commitment surface: a
          launcher in the corner that opens an overlay. Because it overlays
          rather than docks, you can drop it into an existing page without
          touching that page&apos;s layout — which is exactly when to reach for
          it over the Sidebar.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What does a 24% win rate tell me about this pipeline?"]}
            expect="The placeholder reads “Ask the popup anything...” — that string comes from the labels prop — and the cards behind never shift when you open or close it."
            fail="The content reflows on toggle, or the placeholder is the default. The labels prop is not reaching the composer."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/popup/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Popup-specific props">
        <dl className="space-y-2 text-sm">
          {[
            ["defaultOpen", "Whether the popup starts open on first render."],
            ["agentId", "Agent slug the popup talks to."],
            ["labels", "Header copy, placeholder, disclaimer."],
            ["header", "Slot for the popup header bar."],
            ["toggleButton", "Slot for the floating launcher button."],
          ].map(([name, desc]) => (
            <div
              key={name}
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
            >
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-36 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </>
  );
}
