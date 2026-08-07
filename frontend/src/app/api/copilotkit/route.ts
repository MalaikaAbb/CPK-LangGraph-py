import {
  CopilotRuntime,
  ExperimentalEmptyAdapter,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

import { A2UI_FIXED_AGENT_ID, AGENT_IDS } from "@/lib/agents";
import { buildAgents, describeTransport } from "@/lib/runtime-agents";

/**
 * The main runtime — the Quickstart's route, widened from one agent to the
 * whole registry and taught both of its deployment tabs.
 *
 * The Quickstart registers exactly one agent and shows a different class per
 * tab: `LangGraphHttpAgent({ url })` for FastAPI, `LangGraphAgent({
 * deploymentUrl, graphId })` for LangSmith. This harness has one graph per doc
 * route, so `buildAgents()` applies whichever of those two the active transport
 * calls for, once per registered id. Nothing else about the route changes
 * between tabs — that is the point of implementing both.
 */
const serviceAdapter = new ExperimentalEmptyAdapter();

const runtime = new CopilotRuntime({
  agents: buildAgents(AGENT_IDS),
  // A2UI, scoped to the fixed-schema agent with tool injection off. That agent
  // owns its own `display_flight` tool and returns the operations container
  // itself, so injecting `generate_a2ui` alongside it would give the model two
  // ways to draw the same card. The middleware still detects the operations and
  // renders the surface.
  //
  // The dynamic-schema route deliberately does not go through this runtime — it
  // has its own at /api/copilotkit-declarative-gen-ui, where the catalog on the
  // provider is what turns A2UI on.
  a2ui: { injectA2UITool: false, agents: [A2UI_FIXED_AGENT_ID] },
});

/** Surfaced on `/status` so you can see which transport is live. */
export const GET = async () =>
  Response.json({ ...describeTransport(), agents: AGENT_IDS });

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
