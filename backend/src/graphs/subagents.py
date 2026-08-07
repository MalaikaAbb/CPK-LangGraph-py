"""Backing graph for Sub-Agents.

https://docs.copilotkit.ai/langgraph-python/multi-agent/subagents

The page prints almost this entire module: the `Delegation` TypedDict, the
`operator.add` reducer and the reasoning for it, the three sub-agents, the
`_MAX_CRITIQUE_ITERATIONS` cap, `_invoke_sub_agent`, `_delegation_update`, and
all three delegation tools. All reproduced.

**Two departures, both deliberate.**

1. The printed sub-agents attach `HeaderForwardingMiddleware`, imported from
   `src.agents._header_forwarding_middleware` — a module the docs never show.
   Its own comment explains it exists to propagate `x-aimock-context` headers
   so CopilotKit's *recorded-fixture test harness* keeps matching. It is
   infrastructure for their CI, not part of the sub-agents pattern, and it has
   no meaning outside that harness. Dropped rather than reconstructed.

2. The page never prints the supervisor itself — it stops after the three
   delegation tools. The `create_agent` call at the bottom is this repo's,
   built to the shape the page describes in prose ("a top-level supervisor LLM
   orchestrates one or more specialized sub-agents by exposing each of them as
   a tool", with `CopilotKitMiddleware()` in its middleware list "so the
   delegation log slot streams back to the UI through shared state").

See README §9 for both.
"""

from __future__ import annotations

#region subagents
import operator
import uuid
from typing import Annotated, Literal, TypedDict

from langchain.agents import AgentState as BaseAgentState, create_agent
from langchain.tools import ToolRuntime, tool
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.types import Command

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


# ---------------------------------------------------------------------------
# Shared state
# ---------------------------------------------------------------------------


class Delegation(TypedDict):
    id: str
    sub_agent: Literal["research_agent", "writing_agent", "critique_agent"]
    task: str
    status: Literal["completed"]
    result: str


# Cap the supervisor → critique sub-agent loop at a single iteration.
# Without this, the supervisor LLM occasionally re-calls `critique_agent`
# repeatedly on the same draft (visible as stacking 🧐 cards in the
# chat). The critic only adds value once per draft, so we hard-stop
# after `_MAX_CRITIQUE_ITERATIONS` invocations and return a no-op
# result.
_MAX_CRITIQUE_ITERATIONS = 1


class AgentState(BaseAgentState):
    """Shared state. `delegations` is rendered as a live log in the UI.

    `delegations` uses an `operator.add` reducer so that concurrent
    sub-agent emissions in the same supervisor step accumulate into a
    single list instead of conflicting (LangGraph would otherwise raise
    `INVALID_CONCURRENT_GRAPH_UPDATE` — "Can receive only one value per
    step. Use an Annotated key to handle multiple values.").
    """

    delegations: Annotated[list[Delegation], operator.add]


# ---------------------------------------------------------------------------
# Sub-agents (real LLM agents under the hood)
# ---------------------------------------------------------------------------

# Each sub-agent is a full-fledged `create_agent(...)` with its own
# system prompt. They don't share memory or tools with the supervisor —
# the supervisor only sees their return value.
_sub_model = ChatOpenAI(model=MODEL)

_research_agent = create_agent(
    model=_sub_model,
    tools=[],
    system_prompt=(
        "You are a research sub-agent. Given a topic, produce a concise "
        "bulleted list of 3-5 key facts. No preamble, no closing."
    ),
)

_writing_agent = create_agent(
    model=_sub_model,
    tools=[],
    system_prompt=(
        "You are a writing sub-agent. Given a brief and optional source "
        "facts, produce a polished 1-paragraph draft. Be clear and "
        "concrete. No preamble."
    ),
)

_critique_agent = create_agent(
    model=_sub_model,
    tools=[],
    system_prompt=(
        "You are an editorial critique sub-agent. Given a draft, give "
        "2-3 crisp, actionable critiques. No preamble."
    ),
)


# Sentinel surfaced when a sub-agent run produces no usable text. Kept
# as a module-level constant so the harness probe (and any UI fallback)
# can match the exact phrase. The leading/trailing angle brackets keep
# it out of plausible LLM phrasing.
SUB_AGENT_EMPTY_SENTINEL = "<sub-agent produced no output>"


def _invoke_sub_agent(agent, task: str) -> str:
    """Run a sub-agent on `task` and return its final prose message."""
    result = agent.invoke({"messages": [HumanMessage(content=task)]})
    messages = result.get("messages", [])
    # Walk newest -> oldest so we pick the answer for THIS task, not a stale
    # intro. Skip empty AIMessages that only carry tool_calls.
    for msg in reversed(messages):
        if isinstance(msg, AIMessage):
            content = msg.content
            if isinstance(content, str) and content.strip():
                return content
            # Some providers stream content as a list of content blocks
            # (e.g. {"type": "text", "text": "..."}); concatenate the text.
            # The `isinstance(block.get("text"), str)` guard rejects
            # `{"type": "text", "text": null}` payloads — a known provider
            # quirk — that would otherwise crash `"".join(...)` with
            # `TypeError: sequence item N: expected str instance, NoneType found`.
            if isinstance(content, list):
                parts = [
                    block["text"]
                    for block in content
                    if isinstance(block, dict)
                    and block.get("type") == "text"
                    and isinstance(block.get("text"), str)
                ]
                joined = "".join(parts).strip()
                if joined:
                    return joined
    return SUB_AGENT_EMPTY_SENTINEL


def _delegation_update(
    sub_agent: str,
    task: str,
    result: str,
    tool_call_id: str,
) -> Command:
    """Append a completed delegation entry to shared state.

    Returns just the new entry (a one-element list). The reducer on
    `AgentState.delegations` is `operator.add`, which concatenates the
    new list with the prior state — so we must NOT echo back the
    existing delegations here, or they would be duplicated each step.
    """
    entry: Delegation = {
        "id": str(uuid.uuid4()),
        "sub_agent": sub_agent,  # type: ignore[typeddict-item]
        "task": task,
        "status": "completed",
        "result": result,
    }
    return Command(
        update={
            "delegations": [entry],
            "messages": [
                ToolMessage(
                    content=result,
                    name=sub_agent,
                    id=str(uuid.uuid4()),
                    tool_call_id=tool_call_id,
                )
            ],
        }
    )


# ---------------------------------------------------------------------------
# Supervisor tools (each tool delegates to one sub-agent)
# ---------------------------------------------------------------------------


# Each @tool wraps a sub-agent invocation. The supervisor LLM "calls"
# these tools to delegate work; each call synchronously runs the
# matching sub-agent, records the delegation into shared state, and
# returns the sub-agent's output as a ToolMessage the supervisor can
# read on its next step.
@tool
def research_agent(task: str, runtime: ToolRuntime) -> Command:
    """Delegate a research task to the research sub-agent.

    Use for: gathering facts, background, definitions, statistics.
    Returns a bulleted list of key facts.
    """
    result = _invoke_sub_agent(_research_agent, task)
    return _delegation_update("research_agent", task, result, runtime.tool_call_id)


@tool
def writing_agent(task: str, runtime: ToolRuntime) -> Command:
    """Delegate a drafting task to the writing sub-agent.

    Use for: producing a polished paragraph, draft, or summary. Pass
    relevant facts from prior research inside `task`.
    """
    result = _invoke_sub_agent(_writing_agent, task)
    return _delegation_update("writing_agent", task, result, runtime.tool_call_id)


@tool
def critique_agent(task: str, runtime: ToolRuntime) -> Command:
    """Delegate a critique task to the critique sub-agent.

    Use for: reviewing a draft and suggesting concrete improvements.

    Capped at `_MAX_CRITIQUE_ITERATIONS` invocations per supervisor run
    — the supervisor LLM occasionally re-calls the critic in a loop and
    each rerun produces near-identical output, so additional calls are
    short-circuited with a no-op result that nudges the supervisor to
    finish.
    """
    state: AgentState = runtime.state  # type: ignore[assignment]
    delegations = state.get("delegations") or []
    prior_critiques = sum(
        1 for d in delegations if d.get("sub_agent") == "critique_agent"
    )
    if prior_critiques >= _MAX_CRITIQUE_ITERATIONS:
        # Short-circuit without appending another delegation entry — the
        # UI renders one card per delegation and we want exactly one
        # critic card per supervisor run, even if the LLM ignores the
        # system prompt and re-issues the call.
        skip_message = (
            "Critique already produced for this run. "
            "Stop calling critique_agent and return your final answer "
            "to the user now."
        )
        return Command(
            update={
                "messages": [
                    ToolMessage(
                        content=skip_message,
                        name="critique_agent",
                        id=str(uuid.uuid4()),
                        tool_call_id=runtime.tool_call_id,
                    )
                ],
            }
        )
    result = _invoke_sub_agent(_critique_agent, task)
    return _delegation_update("critique_agent", task, result, runtime.tool_call_id)
#endregion


#region supervisor
# Not printed on the doc page — built to the shape its prose describes.
graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[research_agent, writing_agent, critique_agent],
    middleware=[CopilotKitMiddleware()],
    state_schema=AgentState,
    system_prompt=(
        "You are a supervisor coordinating three specialists. For any "
        "substantive writing request, work in this order: call "
        "`research_agent` for the facts, then `writing_agent` with those "
        "facts to produce a draft, then `critique_agent` once on that draft. "
        "Call each tool at most once. When the critique returns, reply to "
        "the user with the final polished text and stop — do not delegate "
        "again."
    ),
    checkpointer=checkpointer(),
)
#endregion
