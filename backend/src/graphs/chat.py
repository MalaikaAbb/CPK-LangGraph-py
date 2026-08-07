"""The neutral `create_agent` graphs.

A dozen doc pages are about the *frontend* — which chat component to render,
how to override a slot, how to theme it — and print exactly one backend
snippet between them, the one reproduced in `build_chat_graph` below:

    graph = create_agent(
        model=ChatOpenAI(model="gpt-5.4"),
        tools=[],
        middleware=[CopilotKitMiddleware()],
        system_prompt="You are a helpful, concise assistant.",
    )

That snippet appears under the heading "Wire CopilotKit middleware into your
graph" on Frontend Tools, Components as Tools, Human in the Loop, Programmatic
Control and others — identical each time. Rather than copy it fifteen times,
it is a factory here and each route gets its own instance.

**Why one graph per route instead of one shared graph.** Each compiled graph
carries its own `MemorySaver`, so a conversation on `/prebuilt-components/chat`
does not surface in `/custom-look-and-feel/slots`. Routes that are meant to
share a conversation (the two shared-state read/write pages, State Streaming and
State Rendering) deliberately point at the same id instead — that is noted where
it happens in `registry.py`.

`tools=[]` is not an omission: it is what the docs print. Frontend tools arrive
over the wire from `useFrontendTool` / `useComponent` / `useHumanInTheLoop`, and
`CopilotKitMiddleware` is what puts them on the model's list each turn. A route
whose agent needs a *backend* tool has its own module.
"""

from __future__ import annotations

#region factory
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, REASONING_MODEL, checkpointer

#: The system prompt the docs' own snippet uses, verbatim.
DEFAULT_SYSTEM_PROMPT = "You are a helpful, concise assistant."


def build_chat_graph(
    *,
    system_prompt: str = DEFAULT_SYSTEM_PROMPT,
    model: str = MODEL,
):
    """One `create_agent` graph, shaped exactly as the docs' snippet."""
    return create_agent(
        model=ChatOpenAI(model=model),
        tools=[],
        middleware=[CopilotKitMiddleware()],
        system_prompt=system_prompt,
        checkpointer=checkpointer(),
    )
#endregion


# --- Prebuilt components -------------------------------------------------
# Four surfaces over one agent shape. The pages differ only in which React
# component renders the conversation.

agentic_chat_graph = build_chat_graph()
prebuilt_sidebar_graph = build_chat_graph()
prebuilt_popup_graph = build_chat_graph()
chat_controls_graph = build_chat_graph()


# --- Custom look and feel ------------------------------------------------

chat_customization_css_graph = build_chat_graph()
chat_slots_graph = build_chat_graph()
headless_simple_graph = build_chat_graph()
headless_complete_graph = build_chat_graph()


# --- Reasoning -----------------------------------------------------------
# The only two graphs on a different model. Reasoning cards render from
# REASONING_MESSAGE_* events, which `gpt-4.1-mini` never emits; both reasoning
# pages name o1 / o3 / o4-mini as the models that do. The prompt asks for
# working-out because a reasoning model still skips deliberation on trivia.

_REASONING_PROMPT = (
    "You are a careful analytical assistant. Work problems through step by "
    "step before answering, then give a short final answer."
)

reasoning_default_graph = build_chat_graph(
    system_prompt=_REASONING_PROMPT, model=REASONING_MODEL
)
reasoning_custom_graph = build_chat_graph(
    system_prompt=_REASONING_PROMPT, model=REASONING_MODEL
)


# --- Input modalities ----------------------------------------------------
# Attachments arrive as AG-UI content parts on the user message, so the graph
# needs no attachment-specific wiring — but the model does have to be
# vision-capable for the image case to mean anything. `gpt-4.1-mini` is.

multimodal_graph = build_chat_graph(
    system_prompt=(
        "You are a helpful, concise assistant. When the user attaches an "
        "image, document, or audio file, describe what you actually observe "
        "in it rather than guessing from the filename."
    )
)

# The Voice page mounts <CopilotKit agent="voice-demo"> against a second
# runtime that carries the TranscriptionService. Replies are spoken aloud in
# practice, so they are asked to stay short.
voice_graph = build_chat_graph(
    system_prompt=(
        "You are a helpful voice assistant. The user is speaking to you and "
        "hearing your reply, so answer in one or two short spoken sentences. "
        "No lists, no markdown, no code blocks."
    )
)


# --- App control ---------------------------------------------------------
# Every one of these is the docs' bare `tools=[]` graph. The tools live on the
# frontend; CopilotKitMiddleware forwards them in.

frontend_tools_graph = build_chat_graph()

gen_ui_tool_based_graph = build_chat_graph(
    system_prompt=(
        "You are a helpful, concise assistant. When the user asks to see data "
        "visualized, call the `render_bar_chart` tool the frontend provides "
        "rather than describing the numbers in prose."
    )
)

hitl_in_chat_graph = build_chat_graph(
    system_prompt=(
        "You are a scheduling assistant. When the user asks to book, schedule "
        "or set up a call or meeting, call the `book_call` tool so they can "
        "pick a time. Once they pick one, confirm it in one short sentence."
    )
)

programmatic_control_graph = build_chat_graph()


# --- Subgraphs -----------------------------------------------------------
# See `subgraphs.py` — that page's whole point is a graph-shaped one.
