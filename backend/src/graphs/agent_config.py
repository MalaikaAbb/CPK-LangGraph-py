"""Backing graph for Agent Config.

https://docs.copilotkit.ai/langgraph-python/agent-config

The page's `create_agent` literal is reproduced verbatim, temperature included:

    graph = create_agent(
        model=ChatOpenAI(model="gpt-5.4", temperature=0.4),
        tools=[],
        middleware=[CopilotKitMiddleware()],
        system_prompt=SYSTEM_PROMPT,
    )

It then prints a `read_config_value` helper and a `my_agent_node` that reads the
config out of context and calls `build_system_prompt(tone, expertise,
response_length)` — a function it never defines. The wording of the prompt
`build_system_prompt` returns is therefore this repo's; only its job, turning
three fields into directives, is the page's. See README §9.

The page's node reads context, builds a prompt, and runs a turn. Because this
repo uses `create_agent` (which owns the loop) rather than a hand-rolled node,
the same work happens in a `before_model` middleware hook. The reading logic and
the defaults — `professional` / `intermediate` / `concise` — are the page's.
"""

from __future__ import annotations

#region read-config
import json
from typing import Any, Optional

CONFIG_KEYS = ("tone", "expertise", "responseLength")


def read_config_value(entry: dict) -> Optional[dict]:
    value = entry.get("value")
    if isinstance(value, str):
        try:
            value = json.loads(value)
        except json.JSONDecodeError:
            return None
    if not isinstance(value, dict):
        return None
    if any(key in value for key in CONFIG_KEYS):
        return value
    return None
#endregion


#region build-prompt
#: The page names this function and calls it on every turn but never prints it.
#: The directives below are this repo's; the three axes are the page's.
_TONE = {
    "professional": "Write in a neutral, professional register.",
    "friendly": "Write warmly and conversationally, but stay useful.",
    "playful": "Be light and a little witty, without padding the answer.",
    "formal": "Write formally. No contractions, no colloquialisms.",
}
_EXPERTISE = {
    "beginner": (
        "Assume no background. Define jargon the first time it appears and "
        "prefer a concrete example over an abstract rule."
    ),
    "intermediate": (
        "Assume working familiarity. Skip the basics, explain the "
        "non-obvious parts."
    ),
    "expert": (
        "Assume deep expertise. Skip preamble entirely, use precise "
        "terminology, and go straight to the subtleties and trade-offs."
    ),
}
_LENGTH = {
    "concise": "Answer in at most three sentences.",
    "balanced": "Answer in a short paragraph.",
    "detailed": "Answer thoroughly, using structure where it earns its place.",
}


def build_system_prompt(tone: str, expertise: str, response_length: str) -> str:
    """Turn the three config fields into explicit directives."""
    directives = [
        _TONE.get(tone, _TONE["professional"]),
        _EXPERTISE.get(expertise, _EXPERTISE["intermediate"]),
        _LENGTH.get(response_length, _LENGTH["concise"]),
    ]
    return (
        "You are a helpful assistant. The user has configured how you should "
        "respond; follow these directives exactly:\n"
        + "\n".join(f"- {d}" for d in directives)
    )
#endregion


#region agent
from langchain.agents import create_agent
from langchain.agents.middleware import AgentMiddleware
from langchain_core.messages import SystemMessage
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware, CopilotKitState

from src.graphs._shared import MODEL, checkpointer

SYSTEM_PROMPT = (
    "You are a helpful assistant. Response preferences supplied by the app "
    "are appended each turn; follow them exactly."
)


class ConfigInjectorMiddleware(AgentMiddleware):
    """The page's `my_agent_node`, as a hook rather than a node.

    Reads the newest config entry out of `state["copilotkit"]["context"]`,
    rebuilds the system prompt from it, and prepends it to this turn.
    """

    state_schema = CopilotKitState

    def before_model(self, state, runtime) -> dict[str, Any] | None:
        context_entries = (state.get("copilotkit") or {}).get("context") or []
        cfg = next(
            (
                value
                for entry in reversed(context_entries)
                if (value := read_config_value(entry)) is not None
            ),
            {},
        )
        tone = cfg.get("tone", "professional")
        expertise = cfg.get("expertise", "intermediate")
        response_length = cfg.get("responseLength", "concise")
        system_prompt = build_system_prompt(tone, expertise, response_length)
        return {"messages": [SystemMessage(content=system_prompt)]}


graph = create_agent(
    model=ChatOpenAI(model=MODEL, temperature=0.4),
    tools=[],
    middleware=[CopilotKitMiddleware(), ConfigInjectorMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    state_schema=CopilotKitState,
    checkpointer=checkpointer(),
)
#endregion
