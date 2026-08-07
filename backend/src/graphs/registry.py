"""The single list of graphs this backend exposes.

One entry per doc route that needs a backend. The key is three things at once:

  * the AG-UI agent id the frontend addresses (`agentId="tool-rendering"`),
  * the FastAPI path the graph is mounted at (`POST /tool-rendering`),
  * the `graphId` in `langgraph.json` under the LangSmith transport.

Keeping them identical is what lets one `AGENT_IDS` list in
`frontend/src/lib/agents.ts` address either transport with no mapping table.

Ids follow each doc page's own demo id wherever a page names one
(`sample_agent`, `agentic_chat`, `prebuilt-sidebar`, `reasoning-default`,
`declarative-gen-ui`, …), which is why the casing is inconsistent — that
inconsistency is the docs'.

`langgraph.json` is generated from this file rather than hand-maintained; run
`python -m src.graphs.registry` to regenerate it after adding a graph.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RegisteredGraph:
    """Where a graph lives and which doc page it serves."""

    #: Dotted module path, relative to `src.graphs`.
    module: str
    #: Attribute holding the compiled graph in that module.
    attr: str
    #: Doc page this graph backs, for the runtime cross-check page.
    doc: str


#region registry
REGISTRY: dict[str, RegisteredGraph] = {
    # --- Getting started -------------------------------------------------
    # The Quickstart names its graph `sample_agent` in both deployment tabs.
    "sample_agent": RegisteredGraph(
        "quickstart", "graph", "/langgraph-python/quickstart"
    ),

    # --- Prebuilt components ---------------------------------------------
    # One graph per surface so each route keeps its own conversation.
    "agentic_chat": RegisteredGraph(
        "chat", "agentic_chat_graph", "/langgraph-python/prebuilt-components/chat"
    ),
    "prebuilt-sidebar": RegisteredGraph(
        "chat", "prebuilt_sidebar_graph",
        "/langgraph-python/prebuilt-components/sidebar",
    ),
    "prebuilt-popup": RegisteredGraph(
        "chat", "prebuilt_popup_graph",
        "/langgraph-python/prebuilt-components/popup",
    ),
    "chat-controls": RegisteredGraph(
        "chat", "chat_controls_graph",
        "/langgraph-python/prebuilt-components/chat-controls",
    ),

    # --- Custom look and feel --------------------------------------------
    "chat-customization-css": RegisteredGraph(
        "chat", "chat_customization_css_graph",
        "/langgraph-python/custom-look-and-feel/css",
    ),
    "chat-slots": RegisteredGraph(
        "chat", "chat_slots_graph", "/langgraph-python/custom-look-and-feel/slots"
    ),
    "headless-simple": RegisteredGraph(
        "chat", "headless_simple_graph",
        "/langgraph-python/custom-look-and-feel/headless-ui",
    ),
    "headless-complete": RegisteredGraph(
        "chat", "headless_complete_graph",
        "/langgraph-python/custom-look-and-feel/headless-ui",
    ),
    # The only two graphs on a reasoning model — see `_shared.REASONING_MODEL`.
    "reasoning-default": RegisteredGraph(
        "chat", "reasoning_default_graph",
        "/langgraph-python/custom-look-and-feel/reasoning-messages",
    ),
    "reasoning-custom": RegisteredGraph(
        "chat", "reasoning_custom_graph",
        "/langgraph-python/generative-ui/reasoning",
    ),

    # --- Input modalities ------------------------------------------------
    "multimodal": RegisteredGraph(
        "chat", "multimodal_graph", "/langgraph-python/multimodal-attachments"
    ),
    # The Voice page mounts <CopilotKit agent="voice-demo"> against the
    # second runtime that carries the TranscriptionService.
    "voice-demo": RegisteredGraph("chat", "voice_graph", "/langgraph-python/voice"),

    # --- Generative UI ---------------------------------------------------
    "tool-rendering": RegisteredGraph(
        "tool_rendering", "graph",
        "/langgraph-python/generative-ui/tool-rendering",
    ),
    "gen-ui-tool-based": RegisteredGraph(
        "chat", "gen_ui_tool_based_graph",
        "/langgraph-python/generative-ui/tool-based",
    ),
    "a2ui-fixed-schema": RegisteredGraph(
        "a2ui_fixed", "graph",
        "/langgraph-python/generative-ui/a2ui/fixed-schema",
    ),
    "declarative-gen-ui": RegisteredGraph(
        "declarative_gen_ui", "graph",
        "/langgraph-python/generative-ui/a2ui/dynamic-schema",
    ),

    # --- App control -----------------------------------------------------
    "frontend-tools": RegisteredGraph(
        "chat", "frontend_tools_graph", "/langgraph-python/frontend-tools"
    ),
    "hitl-in-chat": RegisteredGraph(
        "chat", "hitl_in_chat_graph", "/langgraph-python/human-in-the-loop"
    ),
    # Native LangGraph `interrupt()` — the pattern with no ADK counterpart.
    "interrupt-flow": RegisteredGraph(
        "interrupt_flow", "graph",
        "/langgraph-python/human-in-the-loop/interrupt-flow",
    ),
    "programmatic-control": RegisteredGraph(
        "chat", "programmatic_control_graph",
        "/langgraph-python/programmatic-control",
    ),
    "interrupt-headless": RegisteredGraph(
        "interrupt_headless", "graph", "/langgraph-python/programmatic-control"
    ),

    # --- Shared state ----------------------------------------------------
    # Shared State and Render state in your app deliberately share one graph:
    # same conversation, two ways of rendering it.
    "shared-state-read-write": RegisteredGraph(
        "shared_state_read_write", "graph", "/langgraph-python/shared-state"
    ),
    # State Streaming and State Rendering likewise — the docs use one agent
    # for both pages.
    "shared-state-streaming": RegisteredGraph(
        "shared_state_streaming", "graph",
        "/langgraph-python/shared-state/streaming",
    ),
    "readonly-state-agent-context": RegisteredGraph(
        "readonly_state_agent_context", "graph",
        "/langgraph-python/shared-state/agent-readonly",
    ),
    # Reading and Writing agent state ship the identical state definition.
    "shared-state-language": RegisteredGraph(
        "shared_state_language", "graph",
        "/langgraph-python/shared-state/in-app-agent-read",
    ),
    "state-inputs-outputs": RegisteredGraph(
        "state_inputs_outputs", "graph",
        "/langgraph-python/shared-state/state-inputs-outputs",
    ),
    # The Predictive state updates page nests two choices — `agent-type`, then
    # `state-emission` within the custom-graph branch. All three leaves are
    # genuinely different mechanisms, so each gets its own graph.
    "predictive-state-manual-emission": RegisteredGraph(
        "predictive_state_manual_emission", "graph",
        "/langgraph-python/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=manual-emission",
    ),
    "predictive-state-tool-emission": RegisteredGraph(
        "predictive_state_tool_emission", "graph",
        "/langgraph-python/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission",
    ),
    "predictive-state-prebuilt": RegisteredGraph(
        "predictive_state_prebuilt", "graph",
        "/langgraph-python/shared-state/predictive-state-updates?agent-type=prebuilt",
    ),

    # --- Multi-agent -----------------------------------------------------
    "subagents": RegisteredGraph(
        "subagents", "graph", "/langgraph-python/multi-agent/subagents"
    ),

    # --- LangGraph runtime -----------------------------------------------
    "agent-config": RegisteredGraph(
        "agent_config", "graph", "/langgraph-python/agent-config"
    ),
    "agent-app-context": RegisteredGraph(
        "agent_app_context", "graph", "/langgraph-python/agent-app-context"
    ),
    "configurable": RegisteredGraph(
        "configurable", "graph", "/langgraph-python/configurable"
    ),
    "subgraphs": RegisteredGraph(
        "subgraphs", "graph", "/langgraph-python/subgraphs"
    ),
}
#endregion


def load(agent_id: str):
    """Import and return the compiled graph for `agent_id`."""
    from importlib import import_module

    entry = REGISTRY[agent_id]
    module = import_module(f"src.graphs.{entry.module}")
    return getattr(module, entry.attr)


def langgraph_json() -> dict:
    """The `langgraph.json` body for the LangSmith transport.

    Every id in `REGISTRY` becomes a graph entry pointing at `module:attr`,
    which is the format `langgraph dev` expects.
    """
    return {
        "python_version": "3.12",
        "dockerfile_lines": [],
        "dependencies": ["."],
        "package_manager": "uv",
        "graphs": {
            agent_id: f"./src/graphs/{e.module}.py:{e.attr}"
            for agent_id, e in REGISTRY.items()
        },
        "env": ".env",
    }


if __name__ == "__main__":
    # Regenerate langgraph.json:  python -m src.graphs.registry
    import json
    from pathlib import Path

    target = Path(__file__).resolve().parents[2] / "langgraph.json"
    target.write_text(json.dumps(langgraph_json(), indent=2) + "\n")
    print(f"Wrote {target} with {len(REGISTRY)} graphs.")
