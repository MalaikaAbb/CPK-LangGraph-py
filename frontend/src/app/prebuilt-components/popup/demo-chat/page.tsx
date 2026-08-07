"use client";

import {
  CopilotPopup,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `prebuilt-popup` cell, including its `labels` override.
 *
 * The popup overlays the page rather than docking beside it, so the content
 * underneath keeps its full width whether the chat is open or shut.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/prebuilt-components/popup"
      subtitle="graph: prebuilt-popup"
    >
      <div className="relative h-full overflow-y-auto">
        <MainContent />
        <CopilotPopup
          agentId="prebuilt-popup"
          defaultOpen={true}
          labels={{
            chatInputPlaceholder: "Ask the popup anything...",
          }}
        />
        <Suggestions />
      </div>
    </DemoFrame>
  );
}

function MainContent() {
  return (
    <main className="p-8">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Your application
      </h2>
    </main>
  );
}

function Suggestions() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Explain win rate",
        message: "What does a 24% win rate tell me about this pipeline?",
      },
      {
        title: "What should I focus on?",
        message: "Given these numbers, what should I focus on this quarter?",
      },
    ],
    available: "always",
  });
  return null;
}
