"""Backing graph for the Shared State overview and Render state in your app.

https://docs.copilotkit.ai/langgraph-python/shared-state
https://docs.copilotkit.ai/langgraph-python/shared-state/rendering-in-app

The page prints the `create_agent(...)` literal, including its system prompt,
verbatim — but names two things it never defines:

  * `set_notes` — the agent's write side. The page's `NotesCard` component
    describes it exactly: "The agent writes here via its `set_notes` tool. The
    UI re-renders from shared state", and the prompt tells the model to call it
    "with the FULL updated list of short note strings".
  * `PreferencesInjectorMiddleware` — the UI's write side. The prompt says
    "The user's preferences are supplied via shared state and will be added as
    a system message at the start of every turn."

Both are written here to exactly that description; the `create_agent` call
around them is the page's. See README §9.

Two routes share this graph on purpose. The overview page renders agent state in
a sidebar; Render state in your app renders the same state as the main-view
canvas. Pointing both at one agent id is what lets you watch the same
conversation from either page.
"""

from __future__ import annotations

from typing import Any

#region state
from langchain.agents import AgentState as BaseAgentState, create_agent
from langchain.agents.middleware import AgentMiddleware
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import SystemMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer
import uuid


class AgentState(BaseAgentState):
    """The two slots the page's UI reads and writes.

    `notes` is agent-authored (via `set_notes`); `preferences` is UI-authored
    (via `agent.setState`). That split is the whole point of the page — one
    slot flows each way over the same channel.
    """

    notes: list[str]
    preferences: dict[str, Any]
#endregion


#region set-notes
@tool
def set_notes(notes: list[str], runtime: ToolRuntime) -> Command:
    """Replace the shared scratch pad with the given list of observations.

    Pass the FULL list you want kept — existing notes plus any new ones. This
    replaces the stored list rather than appending to it.
    """
    return Command(
        update={
            "notes": notes,
            "messages": [
                ToolMessage(
                    content=f"Stored {len(notes)} notes to shared state.",
                    name="set_notes",
                    id=str(uuid.uuid4()),
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )
#endregion


#region preferences-middleware
class PreferencesInjectorMiddleware(AgentMiddleware):
    """Read UI-authored `preferences` out of state and prepend them each turn.

    The frontend writes this slot with `agent.setState`. Surfacing it as a
    system message — rather than hoping the model notices it in the state blob
    — is what makes the UI's writes visibly steer the reply, which is the
    behaviour the route's pass criteria check for.
    """

    state_schema = AgentState

    def before_model(self, state, runtime) -> dict[str, Any] | None:
        preferences = state.get("preferences")
        if not isinstance(preferences, dict) or not preferences:
            return None

        lines = "\n".join(f"  - {k}: {v}" for k, v in preferences.items())
        return {
            "messages": [
                SystemMessage(
                    content=(
                        "The user set these preferences in the app UI. "
                        f"Honour them on this turn:\n{lines}"
                    )
                )
            ]
        }
#endregion


#region agent
graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[set_notes],
    middleware=[CopilotKitMiddleware(), PreferencesInjectorMiddleware()],
    state_schema=AgentState,
    system_prompt=(
        "You are a helpful, concise assistant. "
        "The user's preferences are supplied via shared state and will be "
        "added as a system message at the start of every turn. Always "
        "respect them. "
        "When the user asks you to remember something, or when you observe "
        "something worth surfacing in the UI, call `set_notes` with the "
        "FULL updated list of short note strings (existing notes + new)."
    ),
    checkpointer=checkpointer(),
)
#endregion
