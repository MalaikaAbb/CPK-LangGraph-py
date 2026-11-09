"""Backing graph for Tool Call Rendering.

https://docs.copilotkit.ai/langgraph-python/generative-ui/tool-rendering

Taken from the page's demo **Code tab** (`src/agents/tool_rendering_agent.py`,
fetched 2026-11-09 from the page's RSC payload). The prose section "The backend
tool definition" still prints only the head of that file (imports, prompt and
`get_weather`), but the Code tab carries all four tools — `get_weather`,
`search_flights`, `get_stock_price`, `roll_d20` — plus a `before_model`
middleware, `stop_after_tool_failure`, that ends the turn with a fixed message
when the last tool call errored. That closes the old gap where the prompt
advertised three tools nothing defined (README §9 item 13, now resolved).

Two harness changes, the same as every graph here: the model literal is
redirected to `_shared.MODEL`, and the checkpointer comes from
`_shared.checkpointer()`. Everything else is verbatim; only the Code tab's own
module docstring (which lists the showcase's three demo cells) is replaced by
this one.
"""

from __future__ import annotations

#region tool
from random import choice, randint

from langchain.agents import create_agent
from langchain.agents.middleware import AgentState, before_model
from langchain.tools import tool
from langchain_core.messages import AIMessage, ToolMessage
from langchain_openai import ChatOpenAI
from langgraph.runtime import Runtime
from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


# Multi-tool-per-question prompt.
#
# This backend serves the tool-rendering demos, whose JOB is to show the
# rendering patterns (per-tool, catch-all, default fallback). The agent
# may call multiple tools per turn when the user asks for them. The
# `roll_d20` tool accepts a deterministic `value` parameter so the
# aimock fixtures can script the exact dice sequence the e2e tests
# assert against.
SYSTEM_PROMPT = (
    "You are a travel & lifestyle concierge. Use the mock tools for "
    "weather, flights, stock prices, or d20 rolls when the user asks; "
    "otherwise reply in plain text. For flights, default origin to 'SFO' "
    "if the user only names a destination. Call multiple tools in one "
    "turn if asked. After tools return, summarize in one short sentence. "
    "Never fabricate data a tool could provide."
)


@tool
def get_weather(location: str) -> dict:
    """Get the current weather for a given location."""
    return {
        "city": location,
        "temperature": 68,
        "humidity": 55,
        "wind_speed": 10,
        "conditions": "Sunny",
    }




@tool
def search_flights(origin: str, destination: str) -> dict:
    """Search mock flights from an origin airport to a destination airport."""
    return {
        "origin": origin,
        "destination": destination,
        "flights": [
            {
                "airline": "United",
                "flight": "UA231",
                "depart": "08:15",
                "arrive": "16:45",
                "price_usd": 348,
            },
            {
                "airline": "Delta",
                "flight": "DL412",
                "depart": "11:20",
                "arrive": "19:55",
                "price_usd": 312,
            },
            {
                "airline": "JetBlue",
                "flight": "B6722",
                "depart": "17:05",
                "arrive": "01:30",
                "price_usd": 289,
            },
        ],
    }


@tool
def get_stock_price(
    ticker: str,
    price_usd: float | None = None,
    change_pct: float | None = None,
) -> dict:
    """Get a mock current price for a stock ticker.

    The optional `price_usd` and `change_pct` arguments let the LLM (or
    aimock fixture) script a deterministic ticker quote for testing —
    when supplied, the tool echoes them back verbatim. When omitted (or
    `None`), the tool returns mock random values. Mirrors the
    deterministic-`value` pattern on `roll_d20`.
    """
    return {
        "ticker": ticker.upper(),
        "price_usd": (
            round(float(price_usd), 2)
            if price_usd is not None
            else round(100 + randint(0, 400) + randint(0, 99) / 100, 2)
        ),
        "change_pct": (
            round(float(change_pct), 2)
            if change_pct is not None
            else round(choice([-1, 1]) * (randint(0, 300) / 100), 2)
        ),
    }


@tool
def roll_d20(value: int = 0) -> dict:
    """Roll a 20-sided die.

    The `value` argument lets the LLM (or aimock fixture) script a
    deterministic roll for testing — the tool simply echoes it back as
    the result. When called without `value` (or with 0), the tool
    returns a random natural d20 roll.
    """
    rolled = value if isinstance(value, int) and 1 <= value <= 20 else randint(1, 20)
    return {"sides": 20, "value": rolled, "result": rolled}
#endregion


#region agent
@before_model(can_jump_to=["end"])
def stop_after_tool_failure(state: AgentState, runtime: Runtime) -> dict | None:
    for message in reversed(state["messages"]):
        if not isinstance(message, ToolMessage):
            break
        if message.status == "error":
            return {
                "messages": [
                    AIMessage(
                        content="The tool could not complete this request. Please retry."
                    )
                ],
                "jump_to": "end",
            }
    return None


# Page: ChatOpenAI(reasoning_effort="none", model="gpt-6-luna"); redirected to
# _shared.MODEL like every graph here (README §9 item 5).
model = ChatOpenAI(model=MODEL)

graph = create_agent(
    model=model,
    tools=[get_weather, search_flights, get_stock_price, roll_d20],
    middleware=[stop_after_tool_failure, CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer(),  # harness: transport-dependent, see _shared
)
#endregion
