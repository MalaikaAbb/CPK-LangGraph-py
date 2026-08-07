"use client";

import {
  CopilotSidebar,
  useConfigureSuggestions,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { useState } from "react";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { Background, DEFAULT_BACKGROUND } from "../background";

/**
 * The doc's `frontend-tools` cell, reproduced.
 *
 * `useFrontendTool` is the whole API: a name, a Zod schema, and a handler that
 * runs in the browser. The agent calls it like any other tool; the difference
 * is that the handler closes over React state, so it can do things no
 * server-side tool could.
 *
 * The return value matters more than it looks. It goes back to the model as the
 * tool result, so the agent can tell whether the change worked and reason about
 * it on the next turn. Returning nothing leaves the model guessing.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/frontend-tools" subtitle="graph: frontend-tools">
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  const [background, setBackground] = useState<string>(DEFAULT_BACKGROUND);

  useFrontendTool({
    name: "change_background",
    description:
      "Change the page background. Accepts any valid CSS background value — colors, linear or radial gradients, etc.",
    parameters: z.object({
      background: z
        .string()
        .describe("The CSS background value. Prefer gradients."),
    }),
    handler: async ({ background }) => {
      setBackground(background);
      return { status: "success" };
    },
  });

  useConfigureSuggestions({
    suggestions: [
      {
        title: "Warm sunset",
        message: "Make the background a warm sunset gradient.",
      },
      {
        title: "Something calmer",
        message: "Now make it something calm and cool-toned.",
      },
    ],
    available: "always",
  });

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1">
        <Background background={background} />
      </div>
      <CopilotSidebar agentId="frontend-tools" defaultOpen={true} />
    </div>
  );
}
