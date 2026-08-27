import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

import { A2UI_DYNAMIC_AGENT_ID } from "@/lib/agents";
import { buildRuntime } from "@/lib/copilot-runtime";
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
 *
 * Moved to the v2 catch-all alongside the main route, and it shares
 * `buildRuntime` — so Intelligence and per-user threads are wired the same way
 * here as on the main endpoint.
 */
const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime({ agents: buildAgents([A2UI_DYNAMIC_AGENT_ID]) }),
  basePath: "/api/copilotkit-declarative-gen-ui",
});

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as DELETE,
};
