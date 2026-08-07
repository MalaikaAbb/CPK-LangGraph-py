"""The Quickstart's agent, reproduced as printed.

<https://docs.copilotkit.ai/langgraph-python/quickstart?agent=bring-your-own>

This is the one graph in the repo built as a hand-rolled `StateGraph` rather
than with `langchain.agents.create_agent`, because that is what the Quickstart
prints. Every page after the Quickstart switches to `create_agent` +
`CopilotKitMiddleware`; those graphs live in the sibling modules.

Both Quickstart tabs — LangSmith and FastAPI — compile the *same* graph. The
only difference between them is the checkpointer (the FastAPI tab adds
`MemorySaver`; the LangSmith tab relies on the platform's own persistence) and
how the graph is served. `backend/main.py` and `backend/langgraph.json` are the
two serving halves; see README §3.
"""

from __future__ import annotations

#region agent
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph

from src.graphs._shared import MODEL, checkpointer


async def mock_llm(state: MessagesState):
    model = ChatOpenAI(model=MODEL)
    system_message = SystemMessage(content="You are a helpful assistant.")
    response = await model.ainvoke(
        [
            system_message,
            *state["messages"],
        ]
    )
    return {"messages": response}


graph = StateGraph(MessagesState)
graph.add_node(mock_llm)
graph.add_edge(START, "mock_llm")
graph.add_edge("mock_llm", END)

# The FastAPI tab compiles with `checkpointer=MemorySaver()`; the LangSmith tab
# compiles bare. `checkpointer()` returns the right one for the active
# transport — see `_shared.py`.
graph = graph.compile(checkpointer=checkpointer())
#endregion
