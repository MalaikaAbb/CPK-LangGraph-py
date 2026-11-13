import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

import { buildRuntime } from "@/lib/copilot-runtime";
import { buildAgents } from "@/lib/runtime-agents";

// Harness glue — the runtime every Components and surfaces demo points at.
//
// The pages give the provider `runtimeUrl="/api/copilotkit"` and change
// nothing on the runtime: when a run carries a catalog, the runtime adds
// `render_ui` and the guide on its own. Kept apart from `/api/copilotkit` so
// the catalog never reaches the other routes' agents (pattern from the
// aws-strands-ts harness, via CPK-LangGraph-TS). The agent is this repo's
// `genui` LangGraph graph, registered as `default` because the pages'
// providers name no agent. `buildAgents` picks HttpAgent (FastAPI) or
// LangGraphAgent (langgraph dev) for the active transport.
const handler = createCopilotRuntimeHandler({
  runtime: buildRuntime({
    agents: {
      default: buildAgents(["genui"]).genui,
    },
  }),
  basePath: "/api/copilotkit-genui",
});

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE };
