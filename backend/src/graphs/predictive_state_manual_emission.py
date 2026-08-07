"""Predictive state updates — custom graph, **manual emission**.

https://docs.copilotkit.ai/langgraph-python/shared-state/predictive-state-updates?agent-type=custom-graph

The page splits into two tabs and this repo implements both, because they are
genuinely different mechanisms rather than two ways of writing one thing:

  * **Manual emission** (this file) — you own the nodes, so you call
    `copilotkit_emit_state(config, state)` by hand whenever you want the UI to
    see a prediction. Maximum control, and the only option when the progress
    isn't tied to a tool call at all.
  * **Tool emission** (`predictive_state_tool_emission.py`) — same custom
    graph, but `copilotkit_customize_config` maps a streaming tool argument
    onto the state key and nothing is emitted by hand.
  * **Prebuilt** (`predictive_state_prebuilt.py`) — `create_agent` owns the
    loop, so you declare a `StateItem` mapping instead and the middleware
    emits for you.

The page's own note is worth repeating because it bites: when a node finishes,
its returned state is the single source of truth. Intermediate emissions are
display-only, so anything you want to survive the node has to be in the return
value too — which is why `observed_steps` is both emitted in the loop and
returned at the end.

This file follows the page's "Manual Predictive State Updates" option (the
`state-emission=manual-emission` tab). The
printed snippet is a fragment (`async def chat_node(...)` with `# ...` above and
below, routing to `cpk_action_node` / `tool_node` that it never defines); the
surrounding graph is assembled here to the shape the fragment implies.
"""

from __future__ import annotations

import asyncio

#region state
from copilotkit import CopilotKitState


class AgentState(CopilotKitState):
    observed_steps: list[str]  # Array of completed steps
#endregion


#region node
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit.langgraph import copilotkit_emit_state

from src.graphs._shared import MODEL, checkpointer

# The page simulates a long-running task with a fixed list and a one-second
# pause between steps. Kept verbatim — the point is the emission cadence, not
# the work.
STEPS = [
    "Analyzing input data...",
    "Identifying key patterns...",
    "Generating recommendations...",
    "Formatting final output...",
]


async def chat_node(state: AgentState, config: RunnableConfig):
    # Simulate executing steps one by one
    observed: list[str] = list(state.get("observed_steps") or [])

    for step in STEPS:
        observed = observed + [step]
        state["observed_steps"] = observed
        await copilotkit_emit_state(config, state)
        await asyncio.sleep(1)

    model = ChatOpenAI(model=MODEL)
    system_message = SystemMessage(
        content=(
            "You are a task performer. You have just completed these steps: "
            f"{observed}. Summarise what you did in two short sentences."
        )
    )
    response = await model.ainvoke([system_message, *state["messages"]], config)

    # The emissions above are predictions. Only what is returned here persists
    # past the node boundary, so `observed_steps` is returned as well.
    return {"messages": response, "observed_steps": observed}


builder = StateGraph(AgentState)
builder.add_node("chat_node", chat_node)
builder.add_edge(START, "chat_node")
builder.add_edge("chat_node", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
