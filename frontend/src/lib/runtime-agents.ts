import { LangGraphAgent, LangGraphHttpAgent } from "@copilotkit/runtime/langgraph";

import {
  LANGGRAPH_URL,
  LANGSMITH_API_KEY,
  TRANSPORT,
  type Transport,
} from "./agents";

/**
 * Builds the runtime's `agents` map for whichever deployment tab is active.
 *
 * The Quickstart publishes both halves of this and they differ in exactly one
 * way — which agent class wraps the graph:
 *
 *   FastAPI    `new LangGraphHttpAgent({ url })`
 *              One HTTP endpoint per graph. `backend/main.py` mounts each at
 *              `/{agent_id}`, so the URL carries the routing.
 *
 *   LangSmith  `new LangGraphAgent({ deploymentUrl, graphId, langsmithApiKey })`
 *              One deployment serving many graphs. The base URL is shared and
 *              `graphId` selects among them.
 *
 * Because `registry.py` uses the same string for the agent id, the FastAPI
 * mount path and the `langgraph.json` graph id, both branches can be driven
 * from one list with no lookup table.
 *
 * Shared by all three runtime routes so the transport switch is honoured
 * everywhere, including Voice and the A2UI dynamic-schema endpoint.
 */
export function buildAgents(
  ids: readonly string[],
): Record<string, LangGraphAgent | LangGraphHttpAgent> {
  if (TRANSPORT === "langsmith") {
    return Object.fromEntries(
      ids.map((id) => [
        id,
        new LangGraphAgent({
          deploymentUrl: LANGGRAPH_URL,
          graphId: id,
          langsmithApiKey: LANGSMITH_API_KEY,
        }),
      ]),
    );
  }

  return Object.fromEntries(
    ids.map((id) => [
      id,
      new LangGraphHttpAgent({ url: `${LANGGRAPH_URL}/${id}` }),
    ]),
  );
}

export interface TransportDescription {
  transport: Transport;
  agentClass: "LangGraphAgent" | "LangGraphHttpAgent";
  deploymentUrl: string;
  /** Example resolved endpoint, so the wiring is visible on `/status`. */
  exampleTarget: string;
  requiresLangsmithKey: boolean;
  langsmithKeyPresent: boolean;
}

export function describeTransport(): TransportDescription {
  const langsmith = TRANSPORT === "langsmith";
  return {
    transport: TRANSPORT,
    agentClass: langsmith ? "LangGraphAgent" : "LangGraphHttpAgent",
    deploymentUrl: LANGGRAPH_URL,
    exampleTarget: langsmith
      ? `${LANGGRAPH_URL} (graphId: agentic_chat)`
      : `${LANGGRAPH_URL}/agentic_chat`,
    requiresLangsmithKey: langsmith,
    langsmithKeyPresent: LANGSMITH_API_KEY.length > 0,
  };
}
