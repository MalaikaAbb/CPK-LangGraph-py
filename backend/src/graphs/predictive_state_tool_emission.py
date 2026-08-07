"""Predictive state updates — custom graph, **tool emission**.

https://docs.copilotkit.ai/langgraph-python/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission

The page nests two choices, and this is the second axis of the first one:

    Custom graph ─┬─ Manual emission  → predictive_state_manual_emission.py
                  └─ Tool emission    → this file
    Prebuilt agent ─ StateStreamingMiddleware → predictive_state_prebuilt.py

The difference from the manual variant is *who decides when the UI updates*.
There, the node calls `copilotkit_emit_state(config, state)` itself on a timer,
tied to nothing in particular. Here nothing is emitted by hand at all:
`copilotkit_customize_config` declares a mapping, and CopilotKit forwards the
model's partially-generated `steps` argument into `observed_steps` as the tool
call streams. The node never mentions emission again.

`frontend_actions_node`, the `step_progress_tool` and the `emit_intermediate_state`
mapping are reproduced verbatim from the page.

**Two additions**, both of which the page defines elsewhere or omits entirely:

  1. `AgentState` — printed in the page's earlier "Define the state" step as
     `class AgentState(CopilotKitState): observed_steps: list[str]`.
  2. The `StateGraph` wiring. The node returns `Command(goto=END, …)`, so it
     needs a graph to be a node *of*; the page never shows one for this variant.

**One deviation.** The page's node builds `ChatOpenAI(model="gpt-4")`. Unlike the
`gpt-5.4` in most snippets that is a real model, but every graph in this repo
runs on the shared `MODEL` constant so the suite is consistent and cheap to
exercise. See README §9 item 5.

Note what the tool's body is: nothing. `step_progress_tool` exists only so the
model has something to *call* — the mapping harvests the streaming argument out
of the call itself, long before any body would run.
"""

from __future__ import annotations

#region state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]  # Array of completed steps
#endregion


#region node
from langchain_core.messages import AIMessage, SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.types import Command

from copilotkit.langgraph import copilotkit_customize_config

from src.graphs._shared import MODEL, checkpointer


# Define a step progress tool for the llm to report the steps
@tool
def step_progress_tool(steps: list[str]):
    """Reads and reports steps"""


async def frontend_actions_node(state: AgentState, config: RunnableConfig):
    # Configure CopilotKit to treat step progress tool calls as predictive of the final state
    config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {
                "state_key": "observed_steps",
                "tool": "step_progress_tool",
                "tool_argument": "steps",
            },
        ],
    )

    system_message = SystemMessage(
        content="You are a task performer. Pretend doing tasks you are given, report the steps using step_progress_tool."
    )

    # Provide the actions to the LLM
    model = ChatOpenAI(model=MODEL).bind_tools(
        [
            *state["copilotkit"]["actions"],
            step_progress_tool,
            # your other tools here
        ],
    )

    # Call the model with CopilotKit's modified config
    response = await model.ainvoke(
        [
            system_message,
            *state["messages"],
        ],
        config,
    )

    # Set the steps in state so they are persisted and communicated to the frontend
    if (
        isinstance(response, AIMessage)
        and response.tool_calls
        and response.tool_calls[0].get("name") == "step_progress_tool"
    ):
        return Command(
            goto=END,
            update={
                "messages": response,
                "observed_steps": response.tool_calls[0]
                .get("args", None)
                .get("steps"),
            },
        )

    return Command(goto=END, update={"messages": response})


builder = StateGraph(AgentState)
builder.add_node("frontend_actions_node", frontend_actions_node)
builder.add_edge(START, "frontend_actions_node")
graph = builder.compile(checkpointer=checkpointer())
#endregion
