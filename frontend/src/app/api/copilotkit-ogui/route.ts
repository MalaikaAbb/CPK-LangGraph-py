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

// Dedicated runtime for the Open Generative UI demos.
// Isolated here because the `openGenerativeUI` runtime flag sets
// `openGenerativeUIEnabled: true` globally on the probe response, which
// causes the CopilotKit provider's setTools effect to wipe per-demo
// `useFrontendTool`/`useComponent` registrations in the default runtime.

const openGenUiAgent = buildAgents(["open_gen_ui"])["open_gen_ui"];
const openGenUiAdvancedAgent = buildAgents(["open_gen_ui_advanced"])["open_gen_ui_advanced"];

// Harness: typed by buildAgents (the Code tab types it Record<string, LangGraphAgent>).
const agents: Record<string, ReturnType<typeof buildAgents>[string]> = {
  "open-gen-ui": openGenUiAgent,
  "open-gen-ui-advanced": openGenUiAdvancedAgent,
};

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      // Server-side config is identical for the minimal and advanced cells —
      // the advanced behaviour (sandbox -> host function calls) is wired
      // entirely on the frontend via `openGenerativeUI.sandboxFunctions` on
      // the provider. The single `openGenerativeUI` flag below turns on
      // Open Generative UI for the listed agent(s); the runtime middleware
      // converts each agent's streamed `generateSandboxedUi` tool call into
      // `open-generative-ui` activity events.
      runtime: new CopilotRuntime({
        // @ts-ignore -- see main route.ts
        agents,
        openGenerativeUI: {
          agents: ["open-gen-ui", "open-gen-ui-advanced"],
        },
      }),
      basePath: "/api/copilotkit-ogui",
      mode: "single-route",
    });
    return await copilotHandler(req);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, stack: error.stack },
      { status: 500 },
    );
  }
};