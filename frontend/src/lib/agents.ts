/**
 * The agent ids this app can address, and which transport reaches them.
 *
 * Mirrors the keys of `REGISTRY` in `backend/src/graphs/registry.py`. That one
 * string is the AG-UI agent id, the FastAPI mount path, and the `graphId` in
 * `langgraph.json` all at once, so nothing here has to translate between them.
 *
 * If you add a graph to the Python registry, add its id here too — the
 * `/status` route cross-checks the two lists at runtime and reports drift.
 */

export const AGENT_IDS = [
  // Getting started
  "sample_agent",

  // Prebuilt components
  "agentic_chat",
  "prebuilt-sidebar",
  "prebuilt-popup",
  "chat-controls",

  // Custom look and feel
  "chat-customization-css",
  "chat-slots",
  "headless-simple",
  "headless-complete",
  "reasoning-default",
  "reasoning-custom",

  // Input modalities
  "multimodal",
  "voice-demo",

  // Generative UI
  "tool-rendering",
  "gen-ui-tool-based",
  "a2ui-fixed-schema",
  "declarative-gen-ui",

  // App control
  "frontend-tools",
  "hitl-in-chat",
  "interrupt-flow",
  "programmatic-control",
  "interrupt-headless",

  // Shared state
  "shared-state-read-write",
  "shared-state-streaming",
  "readonly-state-agent-context",
  "shared-state-language",
  "state-inputs-outputs",
  "predictive-state-manual-emission",
  "predictive-state-tool-emission",
  "predictive-state-prebuilt",

  // Multi-agent
  "subagents",

  // LangGraph runtime
  "agent-config",
  "agent-app-context",
  "configurable",
  "subgraphs",
  "guardrails",
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

/**
 * Which of the Quickstart's two deployment tabs the backend is serving.
 *
 * The Quickstart documents both and this repo implements both, because they
 * are the two real ways to put a LangGraph agent behind CopilotKit:
 *
 *   `fastapi`   — `backend/main.py` mounts each graph with
 *                 `add_langgraph_fastapi_endpoint(..., path="/{id}")`, and the
 *                 runtime reaches it with `LangGraphHttpAgent({ url })`.
 *   `langsmith` — `langgraph dev` serves every graph named in
 *                 `backend/langgraph.json`, and the runtime reaches it with
 *                 `LangGraphAgent({ deploymentUrl, graphId })`.
 *
 * Same graphs either way. The switch exists so the Quickstart's two tabs are
 * something you can actually run, not just read.
 */
export type Transport = "fastapi" | "langsmith";

export const TRANSPORT: Transport =
  process.env.LANGGRAPH_TRANSPORT === "langsmith" ? "langsmith" : "fastapi";

/**
 * Where the agent server is listening.
 *
 * The Quickstart uses `LANGGRAPH_DEPLOYMENT_URL` for both tabs and defaults it
 * to `http://localhost:8123`, so that name and default are kept.
 */
export const LANGGRAPH_URL =
  process.env.LANGGRAPH_DEPLOYMENT_URL ?? "http://localhost:8123";

/** Only the LangSmith transport needs this; empty string is what the docs pass. */
export const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY ?? "";

/** The one agent whose runtime must NOT inject the A2UI tool — it owns its own. */
export const A2UI_FIXED_AGENT_ID = "a2ui-fixed-schema";

/** The dynamic-schema agent, served by its own runtime with injection on. */
export const A2UI_DYNAMIC_AGENT_ID = "declarative-gen-ui";
