"""Backing graph for Tool Call Rendering.

https://docs.copilotkit.ai/langgraph-python/generative-ui/tool-rendering

The page wires four renderers on the frontend — `get_weather` and
`search_flights` by name, plus a catch-all that picks up `get_stock_price` and
`roll_d20` — but publishes exactly one backend tool: `get_weather`. That tool is
reproduced verbatim below and is the only one this repo exposes, so the named
renderer has something real to draw. The other three are not invented here. See
README §9.

The page's `SYSTEM_PROMPT` is printed in full and is reproduced verbatim below,
including its instruction to use "the mock tools for weather, flights, stock
prices, or d20 rolls". Three of those four do not exist here, because the page
never defines them — so the model is being told about tools it does not have.
Left as published. The visible consequence is that a flight or stock question
produces prose (or an apology) rather than a tool call. See README §9.
"""

from __future__ import annotations

#region tool
from random import choice, randint  # noqa: F401  (the page's import line)

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


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
#endregion


#region agent
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

graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[get_weather],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer(),
)
#endregion
