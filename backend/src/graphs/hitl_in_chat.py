"""Registry wrapper for a Human-in-the-loop page's agent.

https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/index

The agent lives at the doc's own path, `backend/src/agents/hitl_in_chat_agent.py`
(verbatim except model and checkpointer, as everywhere in this repo; see its
header for provenance). The registry only loads modules under `src/graphs`,
hence this one-line re-export.
"""

from src.agents.hitl_in_chat_agent import graph  # noqa: F401
