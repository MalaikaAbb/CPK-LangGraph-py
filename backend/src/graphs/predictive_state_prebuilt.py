"""Backing graph for Predictive state updates — the "Prebuilt agent" tab.

https://docs.copilotkit.ai/langgraph-python/shared-state/predictive-state-updates?agent-type=prebuilt

Reproduced as printed. The contrast with `predictive_state_custom_graph.py` is
the point of implementing both: there, the node calls `copilotkit_emit_state`
by hand; here, `create_agent` owns the loop, so you declare the mapping once
and `StateStreamingMiddleware` does the emitting.

The mapping is the same concept as State Streaming's, pointed at a list rather
than a string: `step_progress_tool.steps` → `state["observed_steps"]`.

`step_progress_tool` has an empty body in the docs and is left that way. It is
not a stub — the tool exists so the model has something to *call*, and the
middleware harvests the streaming `steps` argument out of the call itself. The
body never needs to run for the UI to fill in.
"""

from __future__ import annotations

#region agent
from langchain.agents import create_agent
from langchain.tools import tool

from copilotkit import (
    CopilotKitMiddleware,
    CopilotKitState,
    StateItem,
    StateStreamingMiddleware,
)

from src.graphs._shared import MODEL, checkpointer


class AgentState(CopilotKitState):
    observed_steps: list[str]


@tool
def step_progress_tool(steps: list[str]):
    """Reports the current steps being executed"""


graph = create_agent(
    model=f"openai:{MODEL}",
    tools=[step_progress_tool],
    middleware=[
        CopilotKitMiddleware(),
        StateStreamingMiddleware(
            StateItem(
                state_key="observed_steps",
                tool="step_progress_tool",
                tool_argument="steps",
            )
        ),
    ],
    system_prompt=(
        "You are a task performer. Report your steps using step_progress_tool."
    ),
    state_schema=AgentState,
    checkpointer=checkpointer(),
)
#endregion
