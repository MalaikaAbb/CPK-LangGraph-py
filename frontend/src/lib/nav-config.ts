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
      {
        path: "/custom-look-and-feel/markdown",
        hasDemo: true,
        agentId: "chat-markdown",
        title: "Markdown Rendering",
        docPath: "/langgraph-python/custom-look-and-feel/markdown",
        summary:
          "The markdownRenderer slot on assistant messages in all three forms: a Streamdown components map, a class string, and a whole replacement component.",
        status: "partial",
        statusNote:
          "Snippets verbatim; route ported from CPK-LangGraph-TS. The page defines no CSS for its my-link / my-heading classes, so the first example is only visible in DevTools. Not yet checked in a browser.",
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
          "The mic transcribes through OpenAI Whisper, so it needs OPENAI_TRANSCRIPTION_API_KEY in the frontend process (the page's 2026-11 name). Without it the mic button is hidden and the route still runs via the doc's sample-audio button.",
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
          "A named renderer for the get_weather tool, plus the wildcard catch-all from useDefaultRenderTool that paints the other three backend tools.",
        status: "partial",
        statusNote:
          "Backend is now the page's Code-tab agent (all four tools + stop_after_tool_failure). Frontend still has only the get_weather card; flights, stocks and d20 render through the default wildcard. The Code tab's flight/stock/d20 cards and retry view are not ported. Not yet checked in a browser.",
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
        path: "/generative-ui/a2ui",
        title: "A2UI",
        docPath: "/langgraph-python/generative-ui/a2ui",
        summary:
          "The A2UI overview: three operations, two approaches, two ways to switch it on, and the surface color variables.",
        status: "reference",
        statusNote:
          "Overview page. Its setup paths are exercised by the Dynamic Schema (catalog on provider) and Fixed Schema (runtime a2ui block + copilotkit.a2ui helpers) routes; the no-catalog injectA2UITool: true combination and the CSS variables are shown, not run.",
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
      {
        path: "/generative-ui/mcp-apps",
        hasDemo: true,
        agentId: "mcp_apps",
        title: "MCP Apps",
        docPath: "/langgraph-python/generative-ui/mcp-apps",
        summary:
          "An MCP server's UI resources rendered inline in the chat as sandboxed iframes, wired by the runtime's mcpApps.servers.",
        status: "partial",
        statusNote:
          "The page's Code tab (Python agent, runtime route, demo page) pointed at the public Excalidraw MCP server; route builds agents via buildAgents. A minimal ./chat is adapted from the CopilotKit showcase (via CPK-LangGraph-TS), without its suggestion chips. Needs network access to mcp.excalidraw.com. Not yet checked in a browser.",
      },
      {
        path: "/generative-ui/open-generative-ui",
        hasDemo: true,
        agentId: "open_gen_ui",
        title: "Open Generative UI",
        docPath: "/langgraph-python/generative-ui/open-generative-ui",
        summary:
          "generateSandboxedUi streaming agent-written HTML/CSS/JS into a sandboxed iframe; an advanced variant adds sandbox functions that call back into the host.",
        status: "partial",
        statusNote:
          "The page's Code tab (two Python agents, runtime route, both demo pages); route builds agents via buildAgents. ./chat (minimal) and ./design-skill (feeds openGenerativeUI.designSkill) are borrowed from the CopilotKit showcase (via CPK-LangGraph-TS); suggestion chips not copied (advanced page's useConfigureSuggestions kept as doc: comments). Advanced variant at /generative-ui/open-generative-ui/advanced. Not yet checked in a browser.",
        path: "/generative-ui/components",
        hasDemo: true,
        agentId: "genui",
        title: "Components and surfaces",
        docPath: "/langgraph-python/generative-ui/components",
        summary:
          "standardUI on the provider: the runtime adds render_ui and its guide, and the agent answers with streamed A2UI 1.0 components.",
        status: "partial",
        statusNote:
          "The page's runtime is a BuiltInAgent TanStack factory (shown, not run); here the same provider config is served by this repo's genui LangGraph graph. Needs @copilotkit 1.85 (bumped here). Not yet checked in a browser.",
      },
      {
        path: "/generative-ui/components/surfaces",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Surfaces",
        docPath: "/langgraph-python/generative-ui/components/surfaces",
        summary:
          "GenerativeUISurface page targets the chat can fill, limit, scroll to, and replace, with per-component error boundaries.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). All published snippets run. Product, ProductRow and the product list are repo scaffolding; ./catalog is taken to be the Catalogs page's shopUI; the model invents the products (no products tool).",
      },
      {
        path: "/generative-ui/components/catalogs",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Catalogs",
        docPath: "/langgraph-python/generative-ui/components/catalogs",
        summary:
          "createGenerativeUI catalogs: typed components, zod and Valibot props, extends, parameterOrder and exportA2UICatalog.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Every snippet runs; Hero, Panel and cartUI are repo scaffolding. fs.writeFileSync is replaced by printing the exported catalog.",
      },
      {
        path: "/generative-ui/components/standard-catalog",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Standard catalog",
        docPath: "/langgraph-python/generative-ui/components/standard-catalog",
        summary:
          "standardUI's 69 components as is, extended with a ProductCard, with Map/Video/HtmlView omitted, and with Card overridden.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). ProductCard and productSchema are repo scaffolding.",
      },
      {
        path: "/generative-ui/components/state-and-actions",
        hasDemo: true,
        agentId: "genui",
        title: "Components · State and actions",
        docPath: "/langgraph-python/generative-ui/components/state-and-actions",
        summary:
          "App state bound into props, functions run on click, events sent to the agent, and writable props that keep user input.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Cart, cart.addItem, the state-catalog ProductCard and the catalogs around the fragment snippets are repo scaffolding. Renderer functions cannot be called by the agent in this version, so allowedCallers is shown as exported only.",
      },
      {
        path: "/generative-ui/components/theming",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Theming",
        docPath: "/langgraph-python/generative-ui/components/theming",
        summary:
          "The theme option's CSS variables, a typed GenerativeUITheme file, dark-mode overrides, map styles, and .a2ui-surface CSS.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The dark-mode script renders in the demo body, not <head>. The page's mapStyle URLs are placeholders, so the Map variant draws no basemap.",
      },
      {
        path: "/generative-ui/components/transports",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Transports",
        docPath: "/langgraph-python/generative-ui/components/transports",
        summary:
          "The render_ui tool transport vs the markdown transport, the runtime's generativeUI flag, and agentIds scoping.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The runtime sample's agent is undefined; this repo's genui LangGraph graph stands in, plus a shop agent so agentIds has one agent inside and one outside.",
      },
      {
        path: "/generative-ui/components/markdown-mode",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Markdown mode",
        docPath: "/langgraph-python/generative-ui/components/markdown-mode",
        summary:
          "The agent writes A2UI operations in a2ui code blocks inside its reply; sendContext: false moves the catalog into forwardedProps.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). The sendContext: false variant renders no UI by design: the only backend shown for it is Python reading forwarded_props, which this repo's TypeScript graph does not.",
      },
      {
        path: "/generative-ui/components/from-a2ui",
        hasDemo: true,
        agentId: "genui",
        title: "Components · Adopt from A2UI",
        docPath: "/langgraph-python/generative-ui/components/from-a2ui",
        summary:
          "The v0.9 a2ui renderer → A2UI 1.0 migration: the After catalog running on the new engine, with the Before code shown.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); built, not yet checked in a browser. Needs @copilotkit 1.85 (bumped here). Airport and Arrow are repo scaffolding. The support matrix rules out @ag-ui/a2ui-toolkit 0.0.5 agent tools, (aws-strands-ts's fixed-schema agent; this repo's builds operations by hand).",
      },
      {
        path: "/generative-ui/json-render",
        hasDemo: true,
        agentId: "byoc_json_render",
        title: "JSON Render",
        docPath: "/langgraph-python/generative-ui/json-render",
        summary:
          "An agent-emitted { root, elements } spec drawn by @json-render/react against a Zod component catalog.",
        status: "partial",
        statusNote:
          "The page's full Code tab, verbatim (own runtime route + own <CopilotKit>), except the route builds its agent via buildAgents and the model is _shared.MODEL. Suggestion chips (./suggestions) not copied; chat.tsx keeps that import/call as doc: comments. Type-checks; not yet checked in a browser.",
      },
      {
        path: "/generative-ui/hashbrown",
        hasDemo: true,
        agentId: "byoc_hashbrown",
        title: "Hashbrown",
        docPath: "/langgraph-python/generative-ui/hashbrown",
        summary:
          "Streamed structured output parsed progressively by @hashbrownai/react and rendered through a component catalog.",
        status: "partial",
        statusNote:
          "The page's full Code tab, verbatim, on @hashbrownai 0.7.0 exactly (nested @ag-ui 1.0.2). Route builds its agent via buildAgents; model is _shared.MODEL. Suggestion chips (./suggestions) not copied; chat.tsx keeps that import/call as doc: comments. Type-checks; not yet checked in a browser.",
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
        path: "/human-in-the-loop/index",
        hasDemo: true,
        agentId: "hitl-in-chat",
        title: "HITL Overview",
        docPath: "/langgraph-python/human-in-the-loop/index",
        summary:
          "The overview's demo: useHumanInTheLoop suspending the run behind an in-chat time picker.",
        status: "partial",
        statusNote:
          "Code tab verbatim (Python agent, demo page, card); the Code tab's showcase route.ts replaced by the main runtime. hitl-in-chat now runs this agent for /human-in-the-loop too. Not yet checked in a browser.",
      },
      {
        path: "/human-in-the-loop/useInterrupt",
        hasDemo: true,
        agentId: "gen-ui-interrupt",
        title: "Pausing the Agent for Input",
        docPath: "/langgraph-python/human-in-the-loop/useInterrupt",
        summary:
          "A backend tool pauses the graph with interrupt(); useInterrupt renders a picker in the chat and resolve() resumes it.",
        status: "broken",
        statusNote:
          "Backend is only the page's printed schedule_meeting tool; the page never builds an agent from it, so no gen-ui-interrupt graph is registered (showcase assembly not borrowed). Frontend: generateFallbackSlots via CPK-LangGraph-TS; TimePickerCard is a minimal stand-in; suggestions hook not copied.",
      },
      {
        path: "/human-in-the-loop/headless",
        hasDemo: true,
        agentId: "interrupt-headless",
        title: "Headless Interrupts",
        docPath: "/langgraph-python/human-in-the-loop/headless",
        summary:
          "The same interrupt resolved from the app surface through a hand-rolled useHeadlessInterrupt over useAgent.",
        status: "partial",
        statusNote:
          "Demo is the doc's interrupt-headless file verbatim plus a minimal stand-in for its undefined AppSurface. The page publishes no backend; served by this repo's existing interrupt-headless graph (shared with Programmatic Control). Not yet checked in a browser.",
      },
      {
        path: "/human-in-the-loop/governed-actions",
        hasDemo: true,
        agentId: "governed-actions",
        title: "Governed Action Approval UI",
        docPath: "/langgraph-python/human-in-the-loop/governed-actions",
        summary:
          "Gating a side-effecting tool call behind an approve/reject card before it runs.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); backend is the HITL pages' frontend_tools.py snippet (no tools, default prompt). The useHumanInTheLoop approval works in principle; the governance behind it (policy engine, GovernedAction emitter, executeSideEffect) is published nowhere, so verdicts are whatever the model invents. The useInterrupt variant is not built. Not yet checked in a browser.",
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
      {
        path: "/webmcp",
        hasDemo: true,
        agentId: "webmcp",
        title: "WebMCP",
        docPath: "/langgraph-python/webmcp",
        summary:
          "A frontend tool mirrored onto document.modelContext so WebMCP browser agents can call it, plus the core-only registration with no agent.",
        status: "partial",
        statusNote:
          "Ported from CPK-LangGraph-TS (via aws-strands-ts); both snippets verbatim, searchOrders is a repo-authored stub. The webmcp option needs CopilotKit 1.71+ and this repo is on 1.70.0, so it is suppressed and ignored: only the chat path works here (README §9 item 37). WebMCP itself also needs Chrome 149+ with the flag or origin trial. Not yet checked in a browser.",
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
          "The page prints the sub-agents and their delegation tools but never the supervisor; that create_agent call is this repo's. Its operator.add reducer contradicts the page's own merge-by-id callout, so the log doubles on a continued thread (README §9 item 30).",
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
          "Server-owned execution settings: a request-local LangGraphAGUIAgent built by build_agent(tenant_id); the browser sends no config.",
        status: "partial",
        statusNote:
          "build_agent and the node are verbatim; the reply node, per-request endpoint and tenant stand-in are harness glue (README §9 item 3). FastAPI transport only. Not yet checked in a browser.",
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
      {
        path: "/deploy-agentcore",
        title: "AWS AgentCore",
        docPath: "/langgraph-python/deploy-agentcore",
        summary:
          "Putting a CopilotKit frontend on an agent hosted on AWS Bedrock AgentCore: CDK starter, or an HttpAgent + custom runner pointed at /invocations.",
        status: "reference",
        statusNote:
          "Needs an AWS account (CDK, Cognito, AgentCore Runtime) — not testable locally. Page code kept verbatim in docs-verbatim/deploy-agentcore/.",
      },
      {
        path: "/deploy-langsmith",
        title: "LangSmith Platform",
        docPath: "/langgraph-python/deploy-langsmith",
        summary:
          "Deploying a graph with langgraph deploy and pointing LangGraphAgent at the deployment URL.",
        status: "reference",
        statusNote:
          "Needs a LangSmith deployment — not testable locally. The LangGraphAgent wiring is the same as this repo's langsmith transport. Page code kept verbatim in docs-verbatim/deploy-langsmith/.",
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
