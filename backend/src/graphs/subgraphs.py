"""Backing graph for Subgraphs.

https://docs.copilotkit.ai/langgraph-python/subgraphs

This page prints **no agent code at all** — it links to the CopilotKit Feature
Viewer for the example and says only that "using this feature requires no extra
steps on the agent side" beyond subscribing to `agent.state` on the frontend.
The one snippet it publishes is the four-line `useAgent` call.

So the graph below is this repo's, built to demonstrate the single claim the
page does make: **state written inside a nested graph streams to the client in
real time, exactly as if a top-level node had written it.** See README §9.

The shape is a parent graph whose middle node *is* another compiled graph:

    parent:  START → plan → [research (subgraph)] → summarize → END
                              │
                              └─ subgraph: gather → assess → END

`research` writes `findings` from inside the subgraph. If subgraph streaming
works, the route's Findings panel fills while the subgraph is still running,
before `summarize` has begun. If it were buffered to the parent boundary,
everything would land at once at the end — which is what the route's fail
criterion looks for.

The page also notes you can call `interrupt()` from inside a subgraph. That is
demonstrated on the Interrupts route rather than duplicated here.
"""

from __future__ import annotations

import operator
from typing import Annotated

#region subgraph
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


class AgentState(CopilotKitState):
    """Shared by parent and subgraph, so the nested writes land in one place.

    `findings` uses an `operator.add` reducer so each subgraph node appends
    rather than overwriting — the parent and the subgraph both write it.
    """

    topic: str
    findings: Annotated[list[str], operator.add]
    stage: str


async def gather_node(state: AgentState, config: RunnableConfig):
    """First subgraph node. Writes from *inside* the nested graph."""
    topic = state.get("topic") or "the user's question"
    model = ChatOpenAI(model=MODEL)
    response = await model.ainvoke(
        [
            SystemMessage(
                content=(
                    f"List exactly three short factual bullets about {topic}. "
                    "One per line, no numbering, no preamble."
                )
            )
        ],
        config,
    )
    text = response.content if isinstance(response.content, str) else ""
    bullets = [line.strip(" -•\t") for line in text.splitlines() if line.strip()]
    return {"findings": bullets[:3], "stage": "gathered"}


async def assess_node(state: AgentState, config: RunnableConfig):
    """Second subgraph node, so there is a visible gap between nested writes."""
    model = ChatOpenAI(model=MODEL)
    response = await model.ainvoke(
        [
            SystemMessage(
                content=(
                    "Given these findings, add ONE short caveat line starting "
                    f"with 'Caveat: '. Findings: {state.get('findings')}"
                )
            )
        ],
        config,
    )
    text = response.content if isinstance(response.content, str) else ""
    return {"findings": [text.strip()], "stage": "assessed"}


_research = StateGraph(AgentState)
_research.add_node("gather", gather_node)
_research.add_node("assess", assess_node)
_research.add_edge(START, "gather")
_research.add_edge("gather", "assess")
_research.add_edge("assess", END)

#: Compiled without a checkpointer — a subgraph inherits the parent's.
research_subgraph = _research.compile()
#endregion


#region parent
async def plan_node(state: AgentState, config: RunnableConfig):
    """Pull the topic out of the conversation so the subgraph has an input."""
    last = state["messages"][-1] if state.get("messages") else None
    topic = ""
    if last is not None and isinstance(getattr(last, "content", None), str):
        topic = last.content
    return {"topic": topic, "stage": "planning"}


async def summarize_node(state: AgentState, config: RunnableConfig):
    model = ChatOpenAI(model=MODEL)
    system_message = SystemMessage(
        content=(
            "Summarise these research findings for the user in two short "
            f"sentences: {state.get('findings')}"
        )
    )
    response = await model.ainvoke(
        [system_message, *state["messages"]], config
    )
    return {"messages": response, "stage": "done"}


builder = StateGraph(AgentState)
builder.add_node("plan", plan_node)
# The subgraph is added exactly like any other node — that is the whole idea.
builder.add_node("research", research_subgraph)
builder.add_node("summarize", summarize_node)
builder.add_edge(START, "plan")
builder.add_edge("plan", "research")
builder.add_edge("research", "summarize")
builder.add_edge("summarize", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
