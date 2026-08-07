"use client";

import {
  CopilotSidebar,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `prebuilt-sidebar` cell.
 *
 * The page's snippet renders `<MainContent />`, `<CopilotSidebar agentId
 * defaultOpen />` and `<Suggestions />` as three siblings under the provider.
 * That sibling relationship is the point: the sidebar docks alongside your
 * content instead of overlaying it, so toggling it must not reflow the main
 * column.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/sidebar"
      subtitle="graph: prebuilt-sidebar"
    >
      <div className="flex h-full">
        <MainContent />
        <CopilotSidebar agentId="prebuilt-sidebar" defaultOpen={true} />
        <Suggestions />
      </div>
    </DemoFrame>
  );
}

function MainContent() {
  return (
    <main className="min-w-0 flex-1 overflow-y-auto p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Your application
      </h2>
     
    </main>
  );
}

/** The page's third sibling — suggestions registered outside the chat itself. */
function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Summarize the dashboard",
        message: "Summarize what these metrics suggest about the business.",
      },
      {
        title: "What is churn risk?",
        message: "Explain what churn risk means in one short paragraph.",
      },
    ],
    available: "always",
  });
  return null;
}
