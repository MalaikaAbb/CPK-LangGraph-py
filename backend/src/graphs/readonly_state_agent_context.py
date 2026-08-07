"""Backing graph for Agent Read-Only Context.

https://docs.copilotkit.ai/langgraph-python/shared-state/agent-readonly

Reproduced as printed. The whole backend is one `create_agent` call — there is
deliberately no tool and no state slot, because the point of the page is that
`useAgentContext` is a one-way channel. The frontend publishes values;
`CopilotKitMiddleware` threads them into the model's history each turn; the
model has no setter to write any of them back.
"""

from __future__ import annotations

#region agent
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer

graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "You are a helpful, concise assistant. The frontend may provide "
        "read-only context about the user (e.g. name, timezone, recent "
        "activity) via the `useAgentContext` hook. Always consult that "
        "context when it is relevant — address the user by name if known, "
        "respect their timezone when mentioning times, and reference "
        "recent activity when it helps you answer. Keep responses short."
    ),
    checkpointer=checkpointer(),
)
#endregion
