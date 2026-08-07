"use client";

import {
  CopilotChat,
  CopilotKit,
  useConfigureSuggestions,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { catalog } from "../a2ui/catalog";

/**
 * The doc's `a2ui-fixed-schema` cell.
 *
 * A nested `<CopilotKit>` because the catalog is a provider-level prop —
 * `a2ui={{ catalog }}` is what registers the component vocabulary and wires the
 * A2UI activity-message renderer.
 *
 * The runtime it points at is the main one, which sets
 * `a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] }`. That
 * combination is the whole configuration story for fixed schemas: A2UI on,
 * tool injection off, because this agent owns its own `display_flight` and
 * would otherwise be handed a second way to draw the same card.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/a2ui/fixed-schema"
      subtitle="graph: a2ui-fixed-schema"
    >
      <CopilotKit
        runtimeUrl="/api/copilotkit"
        agent="a2ui-fixed-schema"
        a2ui={{ catalog }}
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
        title: "Find a flight",
        message: "Find me a flight from SFO to JFK.",
      },
      {
        title: "Somewhere further",
        message: "I need to get to Tokyo next month.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="a2ui-fixed-schema" className="h-full" />;
}
