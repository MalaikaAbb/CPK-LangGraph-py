"""Predictive state updates — custom graph, **tool emission**.

https://docs.copilotkit.ai/langgraph-python/shared-state/predictive-state-updates?agent-type=custom-graph&state-emission=tool-emission

The page nests two choices, and this is the second axis of the first one:

    Custom graph ─┬─ Manual emission  → predictive_state_manual_emission.py
                  └─ Tool emission    → this file
    Prebuilt agent ─ StateStreamingMiddleware → predictive_state_prebuilt.py

The difference from the manual variant is *who decides when the UI updates*.
There, the node calls `copilotkit_emit_state(config, state)` itself on a timer.
Here `copilotkit_customize_config` declares a mapping, and CopilotKit forwards
the model's partially-generated `steps` argument into `observed_steps` as the
tool call streams.

Since the page's 2026-11 revision this variant is a **complete graph** and is
reproduced verbatim: `AgentState`, a `step_progress_tool` that returns a
`Command` writing `observed_steps` plus a `ToolMessage`, a `chat_node` with
`parallel_tool_calls=False`, `route_after_chat` (backend tool calls go to a
`ToolNode`, frontend action calls end the run) and the `StateGraph` wiring.
The repo-authored graph wiring that used to fill the gap is gone.

Two harness changes, as everywhere: the model literal is redirected to
`_shared.MODEL`, and the page's `MemorySaver()` becomes the transport-aware
`_shared.checkpointer()`.
"""

from __future__ import annotations

from src.graphs._shared import MODEL, checkpointer

#region imports
import uuid

from copilotkit import CopilotKitState
from copilotkit.langgraph import copilotkit_customize_config
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import AIMessage, SystemMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver  # noqa: F401  (the page's import; see compile below)
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import ToolNode
from langgraph.types import Command
#endregion


#region state
class AgentState(CopilotKitState):
    observed_steps: list[str]
#endregion


#region node
@tool
def step_progress_tool(steps: list[str], runtime: ToolRuntime) -> Command:
    """Report the current steps being executed."""
    return Command(
        update={
            "observed_steps": steps,
            "messages": [
                ToolMessage(
                    content="Steps recorded to shared state.",
                    name="step_progress_tool",
                    id=str(uuid.uuid4()),
                    tool_call_id=runtime.tool_call_id,
                )
            ],
        }
    )

tools = [step_progress_tool]
# Page: ChatOpenAI(model="gpt-6-luna", reasoning_effort="none"); redirected to
# _shared.MODEL (README §9 item 5).
model = ChatOpenAI(model=MODEL)

async def chat_node(state: AgentState, config: RunnableConfig):
    streaming_config = copilotkit_customize_config(
        config,
        emit_intermediate_state=[
            {
                "state_key": "observed_steps",
                "tool": "step_progress_tool",
                "tool_argument": "steps",
            },
        ]
    )

    model_with_tools = model.bind_tools(
        [
            *state["copilotkit"]["actions"],
            *tools,
        ],
        parallel_tool_calls=False,
    )

    response = await model_with_tools.ainvoke(
        [
            SystemMessage(
                content="You are a task performer. Report your steps "
                "using step_progress_tool."
            ),
            *state["messages"],
        ],
        streaming_config,
    )
    return {"messages": [response]}

def route_after_chat(state: AgentState):
    last_message = state["messages"][-1]
    if not isinstance(last_message, AIMessage) or not last_message.tool_calls:
        return END

    frontend_action_names = {
        action["name"] for action in state["copilotkit"]["actions"]
    }
    if any(
        call["name"] not in frontend_action_names
        for call in last_message.tool_calls
    ):
        return "tool_node"

    # Frontend action calls are returned to CopilotKit for execution in the UI.
    return END

workflow = (
    StateGraph(AgentState)
    .add_node("chat_node", chat_node)
    .add_node("tool_node", ToolNode(tools))
    .add_edge(START, "chat_node")
    .add_edge("tool_node", "chat_node")
    .add_conditional_edges(
        "chat_node",
        route_after_chat,
        ["tool_node", END],
    )
)

# Page: workflow.compile(checkpointer=MemorySaver()). The harness swaps in the
# transport-aware checkpointer (MemorySaver under FastAPI, none under
# langgraph dev, which rejects a graph that brings its own).
graph = workflow.compile(checkpointer=checkpointer())
#endregion
