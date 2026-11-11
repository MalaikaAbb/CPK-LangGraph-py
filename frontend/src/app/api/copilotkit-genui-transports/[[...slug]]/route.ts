import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";

import { buildAgents } from "@/lib/runtime-agents";

// The Transports page's `app/api/copilotkit/route.ts`. The page prints only the
// `CopilotRuntime` call, with an `agent` it never defines.
//
// Harness glue (pattern from aws-strands-ts, via CPK-LangGraph-TS): `agent`
// (this repo's `genui` LangGraph graph, built for the active transport), the
// `shop` entry, and the handler. `shop` is the id the page's "Only some
// agents" sample lists in `agentIds`, so the demo has one agent inside that
// list and one (`default`) outside it.
const agent = buildAgents(["genui"]).genui;

//#region transports-runtime
const runtime = new CopilotRuntime({
  agents: { default: agent, shop: buildAgents(["genui"]).genui /* harness glue */ },
  generativeUI: true,
});
//#endregion

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit-genui-transports",
});

export const GET = handler;
export const POST = handler;
