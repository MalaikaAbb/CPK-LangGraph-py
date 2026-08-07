"""Backing graph for Input/Output Schemas.

https://docs.copilotkit.ai/langgraph-python/shared-state/state-inputs-outputs

Reproduced from the page's `agent.py`, which is one of the few that prints a
complete graph. Three slots, three fates:

  * `question`  — input only. The UI writes it; the agent never returns it, so
    the UI stays its own source of truth.
  * `answer`    — output only. The agent writes it; the UI reads it.
  * `resources` — internal. Declared on the overall schema and on neither the
    input nor the output schema, so it never crosses the wire in either
    direction.

Unlike Workflow Execution in other integrations, that separation is *enforced*
here rather than conventional: `input_schema` / `output_schema` are what
LangGraph filters against.

**A deprecation the page has not caught up with.** It calls
`StateGraph(OverallState, input=InputState, output=OutputState)`. Both keywords
were renamed in LangGraph 0.5 and warn on 1.2.10:

    LangGraphDeprecatedSinceV05: `input` is deprecated and will be removed.
    Please use `input_schema` instead. Deprecated in LangGraph V0.5 to be
    removed in V2.0.

Reproduced as published rather than modernised, so this file matches the doc.
It works today and warns; it will break on LangGraph 2. See README §9.
"""

from __future__ import annotations

from typing import List

#region agent
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


# Divide the state to 3 parts

# Input schema for inputs you are willing to accept from the frontend
class InputState(CopilotKitState):
    question: str


# Output schema for output you are willing to pass to the frontend
class OutputState(CopilotKitState):
    answer: str


# The full schema, including the inputs, outputs and internal state
# ("resources" in our case)
class OverallState(InputState, OutputState):
    resources: List[str]


async def answer_node(state: OverallState, config: RunnableConfig):
    """Standard chat node, meant to answer general questions."""

    model = ChatOpenAI(model=MODEL)

    # add the input question in the system prompt so it's passed to the LLM
    system_message = SystemMessage(
        content=(
            "You are a helpful assistant. Answer the question: "
            f"{state.get('question')}"
        )
    )

    response = await model.ainvoke(
        [
            system_message,
            *state["messages"],
        ],
        config,
    )

    # extract the answer, which will be assigned to the state soon
    answer = (
        response.content
        if isinstance(response.content, str)
        else str(response.content)
    )

    return {
        "messages": response,
        # include the answer in the returned state
        "answer": answer,
        # Written for the agent's own use. It is absent from OutputState, so
        # LangGraph filters it out before the frontend ever sees it — that
        # filtering is the thing this route exists to demonstrate.
        "resources": [*(state.get("resources") or []), "internal://scratch"],
    }


# finally, before compiling the graph, we define the 3 state components
builder = StateGraph(OverallState, input=InputState, output=OutputState)

# add all the different nodes and edges and compile the graph
builder.add_node("answer_node", answer_node)
builder.add_edge(START, "answer_node")
builder.add_edge("answer_node", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
