import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

import { A2UI_DYNAMIC_AGENT_ID } from "@/lib/agents";
import { buildAgents } from "@/lib/runtime-agents";

/**
 * The A2UI dynamic-schema runtime.
 *
 * A second endpoint exists because the two A2UI routes want opposite settings
 * for the same flag and a runtime carries only one:
 *
 *   fixed-schema   `injectA2UITool: false` — the agent owns `display_flight`
 *                  and returns the operations container itself. Injecting
 *                  `generate_a2ui` too would give the model two ways to draw
 *                  one card.
 *   dynamic-schema injection **on** — the whole mechanism is a secondary LLM,
 *                  inside the injected tool, designing the surface per request.
 *
 * The main runtime sets the former, so dynamic-schema is served here. No `a2ui`
 * block is needed: the route's provider passes `a2ui={{ catalog }}`, and per the
 * doc page a catalog auto-enables A2UI and injects the tool on its own.
 */
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: buildAgents([A2UI_DYNAMIC_AGENT_ID]),
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit-declarative-gen-ui",
  });

  return handleRequest(req);
};
