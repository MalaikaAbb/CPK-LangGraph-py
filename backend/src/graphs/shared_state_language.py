"""Backing graph for Reading agent state and Writing agent state.

https://docs.copilotkit.ai/langgraph-python/shared-state/in-app-agent-read
https://docs.copilotkit.ai/langgraph-python/shared-state/in-app-agent-write

Both pages ship the identical `agent.py`, so both routes share this graph. It is
the **custom-graph** shape the pages actually print — a `chat_node` on a
`StateGraph` — rather than `create_agent`, which no part of either page uses.

The doc's "Define the Agent State" step is reproduced exactly:

    class AgentState(CopilotKitState):
        language: Literal["english", "spanish"] = "english"

    def chat_node(state: AgentState, config: RunnableConfig):
        language = state.get("language", "english")
        # ... add the rest of the node implementation and use the language variable
        return {"language": language}

Note the comment the page attaches to that `state.get(...)` line: *"a default
value in a state class is not read on runtime"*. That is true and worth
verifying — `CopilotKitState` is a `TypedDict`, so the `= "english"` in the class
body is inert. It neither seeds the state nor errors; the key is simply absent on
the first turn, and the in-node fallback is what supplies the default.

**The minimal additions.** The page elides the body with
`# ... add the rest of the node implementation and use the language variable`
and `# ... add the rest of state to return`. Filling those in needs exactly
three things, and nothing else has been added:

  1. a model call that *uses* `language` — a `SystemMessage` naming it, which is
     what makes the UI's `setState` visibly steer the reply;
  2. `messages` in the returned dict alongside `language`;
  3. the `StateGraph` wiring (`add_node` / `add_edge` / `compile`), which the
     page never shows for this example.

**No `set_language` tool.** An earlier revision invented one so the *agent*
could change the language. Neither page defines such a tool and neither needs
it: the read page only displays the slot, and the write page changes it from the
UI with `agent.setState`. Removed. The consequence is that asking the agent in
chat to "switch to Spanish" now does nothing — language moves only from the UI,
which is what the pages actually demonstrate.
"""

from __future__ import annotations

from typing import Literal

#region agent
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


class AgentState(CopilotKitState):
    language: Literal["english", "spanish"] = "english"


async def chat_node(state: AgentState, config: RunnableConfig):
    # If language is not defined, set a value.
    # this is because a default value in a state class is not read on runtime
    language = state.get("language", "english")

    # ... add the rest of the node implementation and use the language variable
    model = ChatOpenAI(model=MODEL)
    system_message = SystemMessage(
        content=(
            "You are a helpful assistant. Help users by answering their "
            f"questions. Always reply in {language}."
        )
    )
    response = await model.ainvoke([system_message, *state["messages"]], config)

    return {
        # ... add the rest of state to return
        "messages": response,
        # return the language to make it available for the next nodes & frontend to read
        "language": language,
    }


builder = StateGraph(AgentState)
builder.add_node("chat_node", chat_node)
builder.add_edge(START, "chat_node")
builder.add_edge("chat_node", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
