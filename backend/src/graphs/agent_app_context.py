"""Backing graph for Readables (frontend data → agent).

https://docs.copilotkit.ai/langgraph-python/agent-app-context

The page splits into "Custom graph" and "Prebuilt agent" tabs. The prebuilt tab
is a one-liner and is reproduced verbatim:

    graph = create_agent(
        model="openai:gpt-5.4",
        tools=[],
        middleware=[CopilotKitMiddleware()],
        system_prompt="You are a helpful assistant.",
        state_schema=CopilotKitState
    )

That is the whole backend. `useAgentContext` entries are threaded in by the
middleware, so the agent reads them without any lookup code.

The custom-graph tab, by contrast, shows the manual lookup — pulling an entry
out of `state["copilotkit"]["context"]` by matching its `description`:

    colleagues_context_item = next(
        (item for item in state["copilotkit"]["context"]
         if item.get("description") == "The current user's colleagues"),
        None
    )

The route renders both halves. This module exports the prebuilt graph (which is
what actually serves the route) plus `find_context_entry`, the custom-graph
tab's lookup, so the page can show the mechanism the middleware is doing for
you. `find_context_entry` is the page's own expression, lifted into a named
function.

Note the relationship to Agent Read-Only Context: same hook, same channel. That
page frames it as "props for the agent"; this one frames it as app data. One
mechanism, two framings — both routes exist because both doc pages do.
"""

from __future__ import annotations

from typing import Any, Optional

#region lookup
def find_context_entry(state: dict, description: str) -> Optional[Any]:
    """The custom-graph tab's manual context lookup.

    Entries published by `useAgentContext` arrive under
    `state["copilotkit"]["context"]`, each shaped `{description, value}`. The
    `description` is the only handle you get, which is why the page stresses
    treating it "like a parameter docstring".

    Unnecessary with `CopilotKitMiddleware` attached — the middleware injects
    every entry into the prompt for you. Kept because the route shows what the
    middleware is doing on your behalf.
    """
    entries = (state.get("copilotkit") or {}).get("context") or []
    item = next(
        (e for e in entries if e.get("description") == description),
        None,
    )
    return item.get("value") if item else None
#endregion


#region agent
from langchain.agents import create_agent

from copilotkit import CopilotKitMiddleware, CopilotKitState

from src.graphs._shared import MODEL, checkpointer

graph = create_agent(  # Works the same for "create_react_agent" or similar options
    model=f"openai:{MODEL}",
    tools=[],  # Backend tools go here
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "You are a helpful assistant. The app shares live context with you "
        "(the current user's colleagues, the page they are on, and what they "
        "have selected). Answer from that context when it is relevant, and "
        "say so plainly when it does not cover the question."
    ),
    state_schema=CopilotKitState,
    checkpointer=checkpointer(),
)
#endregion
