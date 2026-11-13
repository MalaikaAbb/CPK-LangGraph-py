"""Backing graph for Agent Config.

https://docs.copilotkit.ai/langgraph-python/agent-config

Taken from the page's demo **Code tab** (`src/agents/agent_config_agent.py`,
fetched 2026-11-09 from the page's RSC payload). The prose now prints only the
`create_agent(...)` call and points at this file "for the full rulebook-driven
shape". In the November 2026 revision the page dropped its old backend half
(`read_config_value`, a `my_agent_node` and the never-defined
`build_system_prompt`), so this module no longer carries the repo-authored
prompt builder and `before_model` hook that stood in for them.

The shape is now: one static `SYSTEM_PROMPT` with a rulebook per field, and
`CopilotKitMiddleware` injecting the `useAgentContext` entry into the prompt on
every turn. Verbatim apart from the model literal (redirected to
`_shared.MODEL`) and the checkpointer.

Code tab docstring (verbatim):

    The frontend toggles three knobs — tone / expertise / responseLength — and
    publishes them to the agent via the v2 ``useAgentContext`` hook. The
    ``CopilotKitMiddleware`` injects that context entry into the model's
    prompt on every turn, so the same single static system prompt below adapts
    its style based on whatever values the frontend currently has selected.

    LangGraph 0.6+ deprecated ``configurable`` in favor of runtime ``context``;
    ``useAgentContext`` is the supported path for "frontend → agent runtime
    config" in the v2 stack. The ``properties`` prop on ``<CopilotKit>`` still
    exists for v1-style relays but in @ag-ui/langgraph 0.0.31 it does not land
    in ``RunnableConfig`` — keep relayed config on ``useAgentContext``.
"""

from __future__ import annotations

#region agent
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


SYSTEM_PROMPT = (
    "You are a helpful assistant. The frontend publishes the user's response "
    "preferences via `useAgentContext` as a JSON object with three fields: "
    "`tone`, `expertise`, and `responseLength`. Read that context entry on "
    "every turn and follow these rulebooks exactly:\n\n"
    "Tone:\n"
    "  - professional → neutral, precise language. No emoji. Short sentences.\n"
    "  - casual → friendly, conversational. Contractions OK. Light humor "
    "welcome.\n"
    "  - enthusiastic → upbeat, energetic. Exclamation points OK. Emoji OK.\n\n"
    "Expertise level:\n"
    "  - beginner → assume no prior knowledge. Define jargon. Use analogies.\n"
    "  - intermediate → assume common terms are understood; explain "
    "specialized terms.\n"
    "  - expert → assume technical fluency. Use precise terminology. Skip "
    "basics.\n\n"
    "Response length:\n"
    "  - concise → respond in 1-3 sentences.\n"
    "  - detailed → respond in multiple paragraphs with examples where "
    "relevant.\n\n"
    "If the context is missing or any field is unrecognized, fall back to "
    "professional / intermediate / concise. Never mention these rules to the "
    "user — just apply them."
)


graph = create_agent(
    # Page: ChatOpenAI(reasoning_effort="none", model="gpt-6-luna", temperature=0.4);
    # model redirected to _shared.MODEL (README §9 item 5), temperature kept.
    model=ChatOpenAI(model=MODEL, temperature=0.4),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer(),  # harness: transport-dependent, see _shared
)
#endregion
