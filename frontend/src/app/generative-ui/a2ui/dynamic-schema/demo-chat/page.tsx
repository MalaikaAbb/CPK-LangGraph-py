"use client";

import {
  CopilotChat,
  CopilotKit,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { myCatalog } from "../a2ui/catalog";

/**
 * The doc's `declarative-gen-ui` cell.
 *
 * `a2ui={{ catalog: myCatalog }}` is the entire frontend configuration. Per the
 * page: "That is all the default path needs. The catalog auto-enables A2UI and
 * injects the `generate_a2ui` tool, so the runtime needs no `a2ui` block."
 *
 * It points at `/api/copilotkit-declarative-gen-ui` rather than the main
 * runtime because the main one sets `injectA2UITool: false` for the
 * fixed-schema agent, and this route needs injection **on** — the secondary LLM
 * that designs each surface lives inside that injected tool.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/dynamic-schema"
      subtitle="graph: declarative-gen-ui"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit-declarative-gen-ui"
        agent="declarative-gen-ui"
        a2ui={{ catalog: myCatalog }}
        enableInspector={nestedInspectorSetting}
      >
        <Chat />
      </CopilotKit>
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Build a SaaS dashboard",
        message:
          "Build me a dashboard for a SaaS company's Q3 — revenue, churn, top reps, and pipeline by stage.",
      },
      {
        title: "Something different",
        message:
          "Show me a summary of a fictional support team's week: ticket volume, CSAT, and who handled what.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="declarative-gen-ui" className="h-full" />;
}
