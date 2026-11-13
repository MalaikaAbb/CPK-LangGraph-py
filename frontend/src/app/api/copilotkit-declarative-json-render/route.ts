/**
 * Dedicated runtime for the declarative-json-render demo.
 *
 * Splitting into its own endpoint (mirroring beautiful-chat +
 * declarative-gen-ui) keeps the `byoc_json_render` graph isolated from
 * the default multi-agent `/api/copilotkit` runtime. The frontend's
 * demo page (src/app/demos/declarative-json-render/page.tsx) points
 * `<CopilotKit runtimeUrl>` here. The Python module + langgraph graph
 * ID retain the legacy `byoc_json_render` name; only the user-facing
 * slug, route, and frontend folder were renamed.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
// Harness change: the Code tab builds `new LangGraphAgent({ deploymentUrl,
// graphId })`, which only reaches a `langgraph dev` / LangSmith server. This
// repo defaults to the FastAPI transport, so — like the Voice and A2UI routes —
// the agent comes from `buildAgents`, which picks LangGraphAgent or HttpAgent
// for the active transport. Agent key, graph id, basePath and single-route
// mode are the Code tab's.
import { buildAgents } from "@/lib/runtime-agents";

const byocJsonRenderAgent = buildAgents(["byoc_json_render"])["byoc_json_render"];

const runtime = new CopilotRuntime({
  // @ts-ignore -- same-shape mismatch as the other dedicated routes in this
  // package; the LangGraphAgent satisfies the runtime's agent interface at
  // runtime but the generics don't line up across the v1/v2 boundary.
  agents: { byoc_json_render: byocJsonRenderAgent },
});

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime,
      basePath: "/api/copilotkit-declarative-json-render",
      mode: "single-route",
    });
    return await copilotHandler(req);
  } catch (error: unknown) {
    const e = error as { message?: string; stack?: string };
    return NextResponse.json(
      { error: e.message, stack: e.stack },
      { status: 500 },
    );
  }
};