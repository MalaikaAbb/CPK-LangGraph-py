"use client";

import { standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { GenUIDemo } from "../_shared/genui-demo";

/**
 * The Components and surfaces overview: `generativeUI={{ ui: standardUI }}`
 * on the provider, a bare chat, and "Compare the Starter, Team, and
 * Enterprise plans in a table". Provider shape is the page's; it points at
 * /api/copilotkit-genui (this repo's `genui` LangGraph graph) rather than the
 * page's BuiltInAgent TanStack runtime.
 */
export default function DemoPage() {
  return (
    <DemoFrame parentPath="/generative-ui/components" subtitle="standardUI · agent: genui">
      <GenUIDemo
        variants={[
          {
            id: "standard",
            label: "standardUI",
            generativeUI: { ui: standardUI },
            welcome: "Try: Compare the Starter, Team, and Enterprise plans in a table",
          },
        ]}
      />
    </DemoFrame>
  );
}
