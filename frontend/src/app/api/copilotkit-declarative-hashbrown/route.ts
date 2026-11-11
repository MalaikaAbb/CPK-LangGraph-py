// Dedicated runtime for the declarative-hashbrown demo.
//
// The demo page (`src/app/demos/declarative-hashbrown/page.tsx`) wraps the
// `<Chat />` component (`./chat.tsx`) in the HashBrownDashboard provider;
// `Chat` overrides the CopilotChat assistantMessage slot with a renderer
// that consumes hashbrown-shaped structured output via `@hashbrownai/react`'s
// `useUiKit` + `useJsonParser`. The Python module + langgraph graph ID
// retain the legacy `byoc_hashbrown` name (only the user-facing slug,
// route, and frontend folder were renamed); the system prompt that
// produces the hashbrown shape lives in
// `src/agents/byoc_hashbrown_prompt.py`.

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

const byocHashbrownAgent = buildAgents(["byoc_hashbrown"])["byoc_hashbrown"];

const runtime = new CopilotRuntime({
  // @ts-ignore -- see main route.ts
  agents: { "declarative-hashbrown-demo": byocHashbrownAgent },
});

export const POST = async (req: NextRequest) => {
  try {
    const copilotHandler = createCopilotRuntimeHandler({
      runtime,
      basePath: "/api/copilotkit-declarative-hashbrown",
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