import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/sidebar" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotSidebar&gt;</code> docks to the side of the app and
          renders as a <em>sibling</em> of your main content rather than on top
          of it. That is the whole distinction from Popup: opening and closing it
          changes the space available to your layout, and your layout is expected
          to cope.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Summarize what these metrics suggest about the business."]}
            expect="The toggle collapses and restores the sidebar, and the main column keeps its width — the metric cards never move."
            fail="The cards jump or reflow when you toggle. That is popup behaviour; the sidebar is not a sibling of the content."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/sidebar/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Sidebar-specific props">
        <dl className="space-y-2 text-sm">
          {[
            ["defaultOpen", "Whether the sidebar starts open on first render."],
            ["agentId", "Agent slug the sidebar talks to."],
            ["labels", "Header copy, placeholder, disclaimer."],
            ["header", "Slot for the sidebar header bar."],
            ["toggleButton", "Slot for the open/close launcher."],
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
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Everything else it accepts comes from{" "}
          <code>&lt;CopilotChat&gt;</code>, which it wraps.
        </p>
      </Panel>
    </>
  );
}
