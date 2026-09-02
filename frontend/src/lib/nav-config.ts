/**
 * The nav, the route headers, and the README status table all read from here,
 * so a doc page and its implementation status are described exactly once.
 *
 * Route paths mirror the doc URLs under docs.copilotkit.ai/langgraph-python.
 * `agentId` is the id the graph is registered under in
 * `backend/src/graphs/registry.py`, which is also the FastAPI mount path and
 * the `langgraph.json` graph id — so a route, its doc page, and its graph line
 * up in one place.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = "https://docs.copilotkit.ai/langgraph-python";

export type RouteStatus =
  | "working"
  | "partial"
  | "reference"
  | "broken"
  | "not-started";

export interface RouteMeta {
  path: string;
  title: string;
  docPath: string;
  summary: string;
  status: RouteStatus;
  statusNote?: string;
  offNav?: boolean;
  /** Owns a live surface at `<path>/demo-chat`. */
  hasDemo?: boolean;
  /** Agent id from `backend/src/graphs/registry.py`. */
  agentId?: string;
}

export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === "/" ? "/demo-chat" : `${route.path}/demo-chat`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: "Getting Started",
    routes: [
      {
        path: "/",
        title: "Introduction",
        docPath: "/langgraph-python",
        summary: "What this harness covers and how the pieces fit together.",
        status: "reference",
        statusNote:
          "Landing page — orientation, the transport switch, and the live graph roster.",
      },
      {
        path: "/quickstart",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Quickstart",
        docPath: "/langgraph-python/quickstart?agent=bring-your-own",
        summary:
          "The bring-your-own-agent path, implemented on both deployment tabs: one StateGraph served either by FastAPI or by langgraph dev.",
        status: "working",
      },
    ],
  },
  {
    title: "Rich Threads",
    routes: [
      {
        path: "/prebuilt-components/copilot-threads-drawer",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Threads Drawer",
        docPath: "/langgraph-python/prebuilt-components/copilot-threads-drawer",
        summary:
          "The drop-in conversation sidebar, wired with no active-thread state of its own.",
        status: "working",
        statusNote:
          "Two separate switches: Intelligence mode for real rows, and a license (publicLicenseKey or licenseToken) for the drawer to render anything but its locked Upgrade view.",
      },
      {
        path: "/headless-threads",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Headless Threads",
        docPath: "/langgraph-python/headless-threads",
        summary:
          "The same thread data through useThreads, with a hand-built list — including rename, which the drawer omits.",
        status: "working",
        statusNote:
          "Needs Intelligence mode. In SSE mode /info reports mutations: false, so rename/archive/delete have no endpoint to call.",
      },
      {
        path: "/threads-lifecycle",
        hasDemo: true,
        agentId: "sample_agent",
        title: "Thread & History Lifecycle",
        docPath: "/langgraph-python/threads-lifecycle",
        summary:
          "Where a threadId comes from, how history replays, and how switching differs from starting fresh.",
        status: "working",
        statusNote:
          "Switch and start are live in either mode; history replay needs a server-side store, so it is inert in SSE mode.",
      },
    ],
  },
  {
    title: "Prebuilt Components",
    routes: [
      {
        path: "/prebuilt-components/chat",
        hasDemo: true,
        agentId: "agentic_chat",
        title: "CopilotChat",
        docPath: "/langgraph-python/prebuilt-components/chat",
        summary:
          "The base inline chat surface, sized to fill whatever container you give it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/sidebar",
        hasDemo: true,
        agentId: "prebuilt-sidebar",
        title: "CopilotSidebar",
        docPath: "/langgraph-python/prebuilt-components/sidebar",
        summary:
          "The collapsible docked chat that wraps your main content rather than covering it.",
        status: "working",
      },
      {
        path: "/prebuilt-components/popup",
        hasDemo: true,
        agentId: "prebuilt-popup",
        title: "CopilotPopup",
        docPath: "/langgraph-python/prebuilt-components/popup",
        summary:
          "The floating launcher that opens an overlay chat on top of the page.",
        status: "working",
      },
      {
        path: "/prebuilt-components/chat-controls",
        hasDemo: true,
        agentId: "chat-controls",
        title: "Open, close, and feedback",
        docPath: "/langgraph-python/prebuilt-components/chat-controls",
        summary:
          "Driving modal state from your own UI with useCopilotChatConfiguration, and capturing thumbs up/down.",
        status: "working",
      },
    ],
  },
  {
    title: "Custom Look and Feel",
    routes: [
      {
        path: "/custom-look-and-feel/css",
        hasDemo: true,
        agentId: "chat-customization-css",
        title: "CSS Customization",
        docPath: "/langgraph-python/custom-look-and-feel/css",
        summary:
          "Re-skinning the chat with the v2 shadcn design tokens and the .copilotKit* class hooks.",
        status: "working",
        statusNote:
          "The page's --copilot-kit-* variable set is v1 and inert against v2 components; the v2 token half is what this route uses.",
      },
      {
        path: "/custom-look-and-feel/slots",
        hasDemo: true,
        agentId: "chat-slots",
        title: "Slots",
        docPath: "/langgraph-python/custom-look-and-feel/slots",
        summary:
          "Overriding chat sub-components at all three levels: class strings, prop objects, and whole components.",
        status: "working",
      },
      {
        path: "/custom-look-and-feel/headless-ui",
        hasDemo: true,
        agentId: "headless-simple",
        title: "Headless UI",
        docPath: "/langgraph-python/custom-look-and-feel/headless-ui",
        summary:
          "A chat built from useAgent and useCopilotKit alone, with no CopilotKit chrome.",
        status: "working",
        statusNote:
          "The page's minimal example. Its 'complete' variant is exercised on the Programmatic Control route instead.",
      },
      {
        path: "/custom-look-and-feel/reasoning-messages",
        hasDemo: true,
        agentId: "reasoning-default",
        title: "Reasoning Messages",
        docPath: "/langgraph-python/custom-look-and-feel/reasoning-messages",
        summary:
          "The built-in reasoning card, and the header/content sub-slots that replace parts of it.",
        status: "partial",
        statusNote:
          "Needs a model that emits reasoning tokens. No page names one for the demo agents, so both reasoning routes run on o4-mini — a model these pages do name.",
      },
    ],
  },
  {
    title: "Input Modalities",
    routes: [
      {
        path: "/multimodal-attachments",
        hasDemo: true,
        agentId: "multimodal",
        title: "Multimodal Attachments",
        docPath: "/langgraph-python/multimodal-attachments",
        summary:
          "Drag-and-drop file attachments sent to the agent as AG-UI content parts.",
        status: "broken",
        statusNote:
          "Blocked upstream. ag-ui-langgraph 0.0.42 injects a `metadata` key into every media content block; OpenAI rejects it with 400 “Unexpected keys in a message content image dict”. Every attachment fails. See README §9 item 2.",
      },
      {
        path: "/voice",
        hasDemo: true,
        agentId: "voice-demo",
        title: "Voice",
        docPath: "/langgraph-python/voice",
        summary:
          "A second runtime carrying a TranscriptionService, which is what makes the composer grow a mic button.",
        status: "partial",
        statusNote:
          "The mic transcribes through OpenAI Whisper, so it needs OPENAI_API_KEY in the frontend process. Without one the route still runs via the doc's sample-audio button.",
      },
    ],
  },
  {
    title: "Generative UI",
    routes: [
      {
        path: "/generative-ui/reasoning",
        hasDemo: true,
        agentId: "reasoning-custom",
        title: "Reasoning",
        docPath: "/langgraph-python/generative-ui/reasoning",
        summary:
          "Replacing the whole reasoning card through the messageView.reasoningMessage slot.",
        status: "partial",
        statusNote: "Same reasoning-model dependency as Reasoning Messages.",
      },
      {
        path: "/generative-ui/tool-based",
        hasDemo: true,
        agentId: "gen-ui-tool-based",
        title: "Components as Tools",
        docPath: "/langgraph-python/generative-ui/tool-based",
        summary:
          "useComponent registering a React component as a tool the agent calls to render it.",
        status: "working",
      },
      {
        path: "/generative-ui/tool-rendering",
        hasDemo: true,
        agentId: "tool-rendering",
        title: "Tool Call Rendering",
        docPath: "/langgraph-python/generative-ui/tool-rendering",
        summary:
          "A named renderer for the get_weather tool, plus the wildcard catch-all from useDefaultRenderTool.",
        status: "partial",
        statusNote:
          "get_weather only. The page wires four renderers but defines just this one backend tool; the other three are not invented here.",
      },
      {
        path: "/generative-ui/state-rendering",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Rendering",
        docPath: "/langgraph-python/generative-ui/state-rendering",
        summary:
          "Rendering agent state as it changes, driven by the same StateStreamingMiddleware as State Streaming.",
        status: "working",
      },
      {
        path: "/generative-ui/a2ui/dynamic-schema",
        hasDemo: true,
        agentId: "declarative-gen-ui",
        title: "A2UI · Dynamic Schema",
        docPath: "/langgraph-python/generative-ui/a2ui/dynamic-schema",
        summary:
          "A bring-your-own-catalog dashboard where a secondary LLM designs the surface per request.",
        status: "partial",
        statusNote:
          "The catalog definitions are the doc's; the leaf UI primitives they render into are this repo's — listed on the page.",
      },
      {
        path: "/generative-ui/a2ui/fixed-schema",
        hasDemo: true,
        agentId: "a2ui-fixed-schema",
        title: "A2UI · Fixed Schema",
        docPath: "/langgraph-python/generative-ui/a2ui/fixed-schema",
        summary:
          "A flight card whose component tree is authored as JSON up front; the tool supplies only the data.",
        status: "partial",
        statusNote:
          "The Book button is inert — a2ui.render in copilotkit 0.1.94 takes no action_handlers. The schema JSON is this repo's; no page prints it.",
      },
    ],
  },
  {
    title: "App Control",
    routes: [
      {
        path: "/frontend-tools",
        hasDemo: true,
        agentId: "frontend-tools",
        title: "Frontend Tools",
        docPath: "/langgraph-python/frontend-tools",
        summary:
          "A tool the agent calls that executes in the browser and changes the page.",
        status: "working",
      },
      {
        path: "/human-in-the-loop",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "Human in the Loop",
        docPath: "/langgraph-python/human-in-the-loop",
        summary:
          "useHumanInTheLoop suspending the run behind a picker until the user answers — the model-initiated pause.",
        status: "working",
      },
      {
        path: "/human-in-the-loop/interrupt-flow",
        hasDemo: true,
        agentId: "interrupt-flow",
        title: "Interrupts",
        docPath: "/langgraph-python/human-in-the-loop/interrupt-flow",
        summary:
          "LangGraph's native interrupt() suspending the graph itself, resolved by useInterrupt — including the two-interrupt enabled-predicate variant.",
        status: "partial",
        statusNote:
          "Two tabs. Single interrupt works. Multiple interrupts reproduces the page's `enabled: ({ eventValue }) => …` verbatim — there is no such field on InterruptEvent, so both predicates return false and neither card ever mounts. See README §9 item 1.",
      },
      {
        path: "/programmatic-control",
        hasDemo: true,
        agentId: "programmatic-control",
        title: "Programmatic Control",
        docPath: "/langgraph-python/programmatic-control",
        summary:
          "Driving runs from code with addMessage, runAgent and stopAgent — the page's headless-complete send pipeline, run verbatim.",
        status: "partial",
        statusNote:
          "Renders nothing, faithfully. The published snippet ends after the handlers and never shows the JSX, so there is no UI to reproduce; it also destructures three helpers it never defines. See README §9 item 19.",
      },
    ],
  },
  {
    title: "Shared State",
    routes: [
      {
        path: "/shared-state",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Shared State",
        docPath: "/langgraph-python/shared-state",
        summary:
          "The two-way channel: the agent writes notes through a tool, the UI writes preferences through setState.",
        status: "partial",
        statusNote:
          "The page publishes its create_agent literal in full but never defines the two things it references — the `set_notes` tool and `PreferencesInjectorMiddleware`. Both are written here to what the page describes in prose. See README §9 item 15.",
      },
      {
        path: "/shared-state/rendering-in-app",
        hasDemo: true,
        agentId: "shared-state-read-write",
        title: "Render state in your app",
        docPath: "/langgraph-python/shared-state/rendering-in-app",
        summary:
          "The same agent state rendered as a main-view canvas rather than inside the chat.",
        status: "working",
      },
      {
        path: "/shared-state/streaming",
        hasDemo: true,
        agentId: "shared-state-streaming",
        title: "State Streaming",
        docPath: "/langgraph-python/shared-state/streaming",
        summary:
          "StateStreamingMiddleware forwarding a tool argument into a state key while it is still being generated.",
        status: "working",
      },
      {
        path: "/shared-state/agent-readonly",
        hasDemo: true,
        agentId: "readonly-state-agent-context",
        title: "Agent Read-Only Context",
        docPath: "/langgraph-python/shared-state/agent-readonly",
        summary:
          "useAgentContext as a one-way UI-to-agent channel — props for the agent, with no setter.",
        status: "working",
      },
      {
        path: "/shared-state/in-app-agent-read",
        hasDemo: true,
        agentId: "shared-state-language",
        title: "Reading agent state",
        docPath: "/langgraph-python/shared-state/in-app-agent-read",
        summary:
          "Reading agent.state.language in your own components — the page's custom chat_node graph, with the UI as the only writer.",
        status: "working",
      },
      {
        path: "/shared-state/in-app-agent-write",
        hasDemo: true,
        agentId: "shared-state-language",
        title: "Writing agent state",
        docPath: "/langgraph-python/shared-state/in-app-agent-write",
        summary:
          "agent.setState writing back, plus the setState-then-runAgent re-run the page describes.",
        status: "working",
      },
      {
        path: "/shared-state/state-inputs-outputs",
        hasDemo: true,
        agentId: "state-inputs-outputs",
        title: "Input/Output Schemas",
        docPath: "/langgraph-python/shared-state/state-inputs-outputs",
        summary:
          "input_schema and output_schema deciding which slots cross the wire — question in, answer out, resources never.",
        status: "working",
        statusNote:
          "Unlike the convention-only split other integrations show, LangGraph enforces this one.",
      },
      {
        path: "/shared-state/predictive-state-updates",
        hasDemo: true,
        agentId: "predictive-state-tool-emission",
        title: "Predictive state updates",
        docPath:
          "/langgraph-python/shared-state/predictive-state-updates?agent-type=prebuilt",
        summary:
          "Intermediate progress emitted mid-node, on all three of the page's variants: manual copilotkit_emit_state, tool-mapped copilotkit_customize_config, and declarative StateStreamingMiddleware.",
        status: "working",
        statusNote:
          "All three leaves of the page's nested agent-type × state-emission choice are live and switchable on the demo — they are genuinely different mechanisms.",
      },
    ],
  },
  {
    title: "Multi-Agent",
    routes: [
      {
        path: "/multi-agent/subagents",
        hasDemo: true,
        agentId: "subagents",
        title: "Sub-Agents",
        docPath: "/langgraph-python/multi-agent/subagents",
        summary:
          "A supervisor delegating to research, writing and critique sub-agents, with a live delegation log.",
        status: "partial",
        statusNote:
          "The page prints the sub-agents and their delegation tools but never the supervisor; that create_agent call is this repo's.",
      },
    ],
  },
  {
    title: "LangGraph Runtime",
    routes: [
      {
        path: "/agent-config",
        hasDemo: true,
        agentId: "agent-config",
        title: "Agent Config",
        docPath: "/langgraph-python/agent-config",
        summary:
          "A typed config object the UI owns, published with useAgentContext and rebuilt into the system prompt each turn.",
        status: "working",
      },
      {
        path: "/agent-app-context",
        hasDemo: true,
        agentId: "agent-app-context",
        title: "Readables",
        docPath: "/langgraph-python/agent-app-context",
        summary:
          "Sharing live app state with the agent via useAgentContext, and the manual state['copilotkit']['context'] lookup the middleware saves you.",
        status: "working",
      },
      {
        path: "/configurable",
        hasDemo: true,
        agentId: "configurable",
        title: "Configurable",
        docPath: "/langgraph-python/configurable",
        summary:
          "Per-run execution parameters forwarded through forwardedProps.config.configurable — auth tokens and session metadata that are not state.",
        status: "partial",
        statusNote:
          "Works, but disproves the page on two points: config_schema is deprecated, and undeclared configurables are NOT filtered out.",
      },
      {
        path: "/subgraphs",
        hasDemo: true,
        agentId: "subgraphs",
        title: "Subgraphs",
        docPath: "/langgraph-python/subgraphs",
        summary:
          "A nested graph used as a node, streaming its state to the UI in real time exactly as a top-level node would.",
        status: "partial",
        statusNote:
          "The page prints no agent code at all — it links to the Feature Viewer. The graph here is this repo's, built to demonstrate the one claim the page makes.",
      },
      {
        path: "/guardrails",
        hasDemo: true,
        agentId: "guardrails",
        title: "Guardrails & DLP",
        docPath: "/langgraph-python/guardrails",
        summary:
          "Screening middleware on both boundaries: PII redaction in and out, an input firewall that ends the run, an output DLP pass, and tool-call policy — ordered ahead of CopilotKitMiddleware.",
        status: "working",
        statusNote:
          "All five snippets run unedited; two of them do nothing useful. CopilotKit drives the graph with astream_events, so OutputFirewall.awrap_model_call — published with its body elided to a comment — scrubs nothing, and ToolFirewall (sync wrap_tool_call only) raises NotImplementedError on the first tool call. See README §9 items 27 and 28.",
      },
    ],
  },
  {
    title: "Observe & Operate",
    routes: [
      {
        path: "/status",
        title: "Status",
        docPath: "/langgraph-python",
        summary:
          "Every route, its doc page and its graph in one table, plus a live cross-check against the running agent server.",
        status: "reference",
      },
      {
        path: "/doc-sync",
        title: "Doc drift",
        docPath: "/langgraph-python",
        summary:
          "Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.",
        status: "reference",
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: "Working",
  partial: "Partial",
  reference: "Reference",
  broken: "Broken",
  "not-started": "Not started",
};
