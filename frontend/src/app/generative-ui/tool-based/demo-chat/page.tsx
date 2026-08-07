"use client";

import { CopilotChat, useComponent, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { BarChart, barChartPropsSchema } from "../bar-chart";

/**
 * The doc's `gen-ui-tool-based` cell: `useComponent` registering a React
 * component as a tool.
 *
 * The registration is the page's four-line snippet verbatim. What it hides is
 * how little else there is — no handler, no backend tool, no result. The
 * component *is* the tool: the runtime advertises it to the agent, the agent
 * calls it with arguments, and CopilotKit renders it with those arguments as
 * props. Nothing executes server-side.
 *
 * Zod validates the model's arguments before they reach the component, so a
 * malformed `data` array fails at the boundary rather than inside Recharts.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-based"
      subtitle="graph: gen-ui-tool-based"
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Chart the months",
        message: "Chart the number of days in each month of 2026.",
      },
      {
        title: "Chart something made up",
        message:
          "Invent plausible monthly signup numbers for a startup's first year and chart them.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="gen-ui-tool-based" className="h-full" />;
}
