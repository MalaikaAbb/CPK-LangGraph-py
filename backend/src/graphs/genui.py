"""`genui` — the agent behind every Components and surfaces route.

https://docs.copilotkit.ai/langgraph-python/generative-ui/components
(and surfaces, catalogs, standard-catalog, state-and-actions, theming,
transports, markdown-mode, from-a2ui)

**Repo-authored, not from the docs.** The nine pages are framework-neutral:
their runtime sample is a TanStack `BuiltInAgent` factory (overview) or
"change nothing on the runtime", and the `render_ui` tool plus its catalog
guide arrive per run from the provider. For a LangGraph graph that means:
expose the run's frontend tools (where `render_ui` lands) and put the run's
context entries (where the guide lands) into the prompt. `CopilotKitMiddleware`
does both, the same way the Frontend Tools and Readables routes rely on it, so
this is the docs' ordinary `create_agent` shape with no backend tools.

The first sentence of the prompt is the Components overview page's own system
prompt; the `render_ui` props hint after it is ported from the CPK-LangGraph-TS
harness (`backend/src/agents/genui.ts`, itself from aws-strands-ts). No backend
tools: the pages' snippets call none (the sibling's `search_products` demo tool
was trimmed after review), so the model fills product props itself.
"""

from __future__ import annotations

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


#region agent
SYSTEM_PROMPT = (
    "You are a helpful assistant. When a visual answer helps, render it with generative UI. "
    "In `render_ui` operations, put each prop directly on the component node next to `id` and `component`; never nest props under a `props` key."
)

graph = create_agent(
    model=ChatOpenAI(model=MODEL, temperature=0),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer(),
)
#endregion
