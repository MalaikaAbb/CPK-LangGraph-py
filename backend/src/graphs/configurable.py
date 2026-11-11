"""Backing graph for Configurable.

https://docs.copilotkit.ai/langgraph-python/configurable

The November 2026 rewrite of the page turns it from "send execution config
from the browser" into "pick the right channel". Browser-supplied
`forwardedProps.config` is now called untrusted: UI preferences go through
agent context (Agent Config), credentials through an `Authorization` header
(Authentication), and graph execution settings are set by the trusted backend.

The Python tab publishes two snippets for that third channel, both reproduced
verbatim below:

1. `build_agent(tenant_id)` — a request-local `LangGraphAGUIAgent` whose
   `config` carries `configurable.tenant_id` and `recursion_limit`. The page
   titles it `main.py`; it lives here because it closes over this module's
   `graph`, and `backend/main.py` calls it once per request.
2. `agent_node` reading `config["configurable"]["tenant_id"]`.

Everything else is harness glue, labelled as such:

- The page leaves `graph` and `AgentState` undefined and its node replies with
  nothing (`return state`). `reply_node` is repo-authored so the run produces a
  message and echoes what the server set into `received_config`, which is the
  only way the route can show it.
- The page says to create the agent "after authentication for each request"
  and defers to the auth guide. This harness has no auth, so `main.py` stands
  in a server-side env var (`CONFIGURABLE_TENANT_ID`, default `tenant-demo`)
  for "the tenant resolved from a validated request".

Only the FastAPI transport serves this route the page's way. Under
`langgraph dev` there is no request-local agent, so `tenant_id` is never set
and `agent_node` raises `KeyError` (the page's tab is self-hosted only).
"""

from __future__ import annotations

from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer


class AgentState(CopilotKitState):
    #: Echoed back so the route can render what the server set. Config is not
    #: part of state, so it is invisible otherwise. Harness glue.
    received_config: dict


#region node
async def agent_node(state: AgentState, config: RunnableConfig):
    tenant_id = config["configurable"]["tenant_id"]
    return state
#endregion


#region reply
# Harness glue — the page's node returns state unchanged, so on its own the run
# ends with an empty chat. This second node re-reads the same server-owned
# config and answers with it.
async def reply_node(state: AgentState, config: RunnableConfig):
    tenant_id = config["configurable"].get("tenant_id")
    recursion_limit = config.get("recursion_limit")
    system_message = SystemMessage(
        content=(
            "You are a helpful, concise assistant. The trusted server running "
            f"you set tenant_id={tenant_id!r} and recursion_limit="
            f"{recursion_limit!r} for this run. If the user asks, report those "
            "two values exactly."
        )
    )
    response = await ChatOpenAI(model=MODEL).ainvoke(
        [system_message, *state["messages"]], config
    )
    return {
        "messages": response,
        "received_config": {
            "tenant_id": tenant_id,
            "recursion_limit": recursion_limit,
        },
    }


workflow = StateGraph(AgentState)
workflow.add_node("agent_node", agent_node)
workflow.add_node("reply_node", reply_node)
workflow.add_edge(START, "agent_node")
workflow.add_edge("agent_node", "reply_node")
workflow.add_edge("reply_node", END)
graph = workflow.compile(checkpointer=checkpointer())
#endregion


#region build-agent
from copilotkit import LangGraphAGUIAgent

def build_agent(tenant_id: str) -> LangGraphAGUIAgent:
    return LangGraphAGUIAgent(
        name="sample_agent",
        description="Tenant-scoped agent",
        graph=graph,
        config={
            "configurable": {"tenant_id": tenant_id},
            "recursion_limit": 50,
        },
    )
#endregion
