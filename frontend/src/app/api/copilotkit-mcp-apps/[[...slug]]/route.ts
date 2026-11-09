// CopilotKit runtime for the MCP Apps cell.
//
// The runtime's `mcpApps` config auto-applies the MCP Apps middleware to the
// agent: when the agent calls a tool backed by an MCP UI resource, the
// middleware fetches the resource and emits the activity event that the
// built-in `MCPAppsActivityRenderer` (registered by CopilotKit internally)
// renders in the chat as a sandboxed iframe.
//
// Reference:
// https://docs.copilotkit.ai/integrations/langgraph/generative-ui/mcp-apps

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
// Harness change: the Code tab builds `new LangGraphAgent({ deploymentUrl,
// graphId })`, which only reaches a `langgraph dev` / LangSmith server. This
// repo defaults to the FastAPI transport, so (as on the Voice, A2UI and
// Declarative routes) each agent comes from `buildAgents`, which picks
// LangGraphAgent or HttpAgent for the active transport. Agent keys, graph ids,
// runtime options, basePath and single-route mode are the Code tab's.
import { buildAgents } from "@/lib/runtime-agents";

const mcpAppsAgent = buildAgents(["mcp_apps"])["mcp_apps"];

// Verbatim graph id. This repo's graph is `headless-complete` (hyphen), so
// nothing is mounted at `headless_complete`; the entry is unused here.
const headlessCompleteAgent = buildAgents(["headless_complete"])["headless_complete"];

// The `mcpApps.servers` config is all you need server-side. The runtime
// auto-applies the MCP Apps middleware to every registered agent: on each
// MCP tool call it fetches the associated UI resource and emits an
// `activity` event that the built-in `MCPAppsActivityRenderer` renders
// inline in the chat.
const runtime = new CopilotRuntime({
  // @ts-ignore
  agents: {
    "mcp-apps": mcpAppsAgent,
    // headless-complete shares this runtime because its cell also exercises
    // MCP Apps rendering (via a hand-rolled `useRenderActivityMessage` in
    // `use-rendered-messages.tsx`).
    "headless-complete": headlessCompleteAgent,
  },
  mcpApps: {
    servers: [
      {
        type: "http",
        url: process.env.MCP_SERVER_URL || "https://mcp.excalidraw.com",
        // Always pin a stable `serverId`. Without it CopilotKit hashes the
        // URL, and a URL change silently breaks restoration of persisted
        // MCP Apps in prior conversation threads.
        serverId: "excalidraw",
      },
    ],
  },
});

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime,
      basePath: "/api/copilotkit-mcp-apps",
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