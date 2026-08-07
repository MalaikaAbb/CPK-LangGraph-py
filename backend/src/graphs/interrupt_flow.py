"""Backing graph for Interrupts (HITL).

https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/interrupt-flow

Reproduced from the page's `agent.py`. This is the one pattern in the suite that
has no counterpart in the non-LangGraph integrations: the pause is enforced by
the *graph*, not chosen by the model. `interrupt("...")` suspends the run
mid-node; the payload surfaces to the client as an `on_interrupt` custom event;
`useInterrupt` renders it; resuming replays the node with the answer in place of
the `interrupt()` return value.

Two consequences worth knowing before testing this route:

  * **It needs a checkpointer.** `interrupt()` works by saving the pending state
    and re-entering the node on resume. Without persistence there is nothing to
    resume into. Under the FastAPI transport that is the `MemorySaver` from
    `_shared.checkpointer()`; under LangSmith it is the platform's.
  * **Nodes re-run from the top.** Everything above the `interrupt()` call
    executes again on resume, so a node that interrupts must not do anything
    non-idempotent before it.

The page also demonstrates two `interrupt()` calls differentiated by a `type`
field, resolved by two `useInterrupt` hooks with `enabled` predicates. That
variant is implemented too — see the `approval` slot below and the matching
pair of hooks on the route.
"""

from __future__ import annotations

from typing import Any

#region agent
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


# This is the state of the agent.
# It inherits from the CopilotKitState properties from CopilotKit.
class AgentState(CopilotKitState):
    agent_name: str
    approval: Any


def chat_node(state: AgentState, config: RunnableConfig):
    # Two interrupts with a `type` discriminator, so the two `useInterrupt`
    # hooks on the frontend can claim one each via their `enabled` predicate.
    if state.get("approval") is None:
        state["approval"] = interrupt(
            {"type": "approval", "content": "please approve"}
        )

    if not state.get("agent_name"):
        # Interrupt and wait for the user to respond with a name
        state["agent_name"] = interrupt(
            {
                "type": "ask",
                "content": "Before we start, what would you like to call me?",
            }
        )

    # Tell the agent its name
    system_message = SystemMessage(
        content=(
            f"You are a helpful assistant named {state.get('agent_name')}. "
            "Introduce yourself by that name, then answer the user."
        )
    )

    response = ChatOpenAI(model=MODEL).invoke(
        [system_message, *state["messages"]],
        config,
    )

    return {
        "agent_name": state.get("agent_name"),
        "approval": state.get("approval"),
        "messages": response,
    }


builder = StateGraph(AgentState)
builder.add_node("chat_node", chat_node)
builder.add_edge(START, "chat_node")
builder.add_edge("chat_node", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
