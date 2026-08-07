"""Backing graph for Configurable.

https://docs.copilotkit.ai/langgraph-python/configurable

The page's contribution is two snippets: a `ConfigSchema` TypedDict, and a node
that reads `config['configurable'].get('authToken', None)`. Both are reproduced.
The surrounding graph is assembled here, since the page prints only the fragment
(`async def agent_node(state, config): ... return state`).

The mechanism is worth stating plainly because it is easy to confuse with shared
state: `configurable` is **per-run execution config**, not state. It does not
persist, the agent cannot write it back, and it never appears in `agent.state`.
Auth tokens and session metadata belong here; anything the UI wants to observe
afterwards belongs in state.

**Two things the page gets wrong on LangGraph 1.2.10.** Both are reproduced as
published rather than corrected, so this file matches the doc:

1. It writes `StateGraph(AgentState, config_schema=ConfigSchema)`.
   `config_schema` was deprecated in LangGraph 1.0 in favour of
   `context_schema`:

       LangGraphDeprecatedSinceV10: `config_schema` is deprecated and will be
       removed. Please use `context_schema` instead.

   Kept as `config_schema=` below. It works and warns today; it will break on
   LangGraph 2.

2. It claims "any item passed to 'configurables' which is not included in the
   schema will be filtered out". It is not. Declaring the schema and then
   forwarding an undeclared key leaves that key fully readable in
   `config['configurable']` — verified against 1.2.10. The schema is a typing
   and introspection aid, not an allow-list, so do not rely on it to strip
   anything security-relevant.

The route forwards one declared key (`authToken`) and one undeclared key side
by side so you can see both arrive, which is what disproves point 2. See
README §9.
"""

from __future__ import annotations

from typing import TypedDict

#region schema
# define which properties will be allowed in the configuration
class ConfigSchema(TypedDict):
    authToken: str
#endregion


#region agent
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


class AgentState(CopilotKitState):
    #: Echoed back so the route can render what actually arrived. Reading the
    #: config is invisible otherwise — it is not part of state by default.
    received_config: dict


async def agent_node(state: AgentState, config: RunnableConfig):
    auth_token = config["configurable"].get("authToken", None)
    print("Auth Token: ", auth_token)
    # Everything the app forwarded, declared or not. `configurable` also
    # carries LangGraph's own bookkeeping (thread_id, checkpoint_ns, …), so
    # those are dropped — but undeclared *app* keys are deliberately kept, to
    # show that `context_schema` did not filter them.
    runtime_keys = {"thread_id", "checkpoint_id", "checkpoint_ns", "checkpoint_map"}
    forwarded = {
        key: value
        for key, value in config["configurable"].items()
        if key not in runtime_keys and not key.startswith("__")
    }

    system_message = SystemMessage(
        content=(
            "You are a helpful, concise assistant running with a per-run "
            "execution config. Your auth token for this run is "
            f"{auth_token!r}. If the user asks about it, tell them whether one "
            "was supplied and what it is — it is a demo value, not a secret."
        )
    )
    response = await model_call(system_message, state, config)

    return {"messages": response, "received_config": forwarded}


async def model_call(system_message, state, config):
    model = ChatOpenAI(model=MODEL)
    return await model.ainvoke([system_message, *state["messages"]], config)


# when defining the state graph, apply the config schema
workflow = StateGraph(AgentState, config_schema=ConfigSchema)
workflow.add_node("agent_node", agent_node)
workflow.add_edge(START, "agent_node")
workflow.add_edge("agent_node", END)
graph = workflow.compile(checkpointer=checkpointer())
#endregion
