"""Registry wrapper for a Generative UI › Open-ended page's agent.

https://docs.copilotkit.ai/langgraph-python/generative-ui/open-generative-ui

The agent itself is the page's demo Code tab file, kept at the doc's own path
`backend/src/agents/open_gen_ui_advanced_agent.py` (verbatim except model and checkpointer, as
everywhere in this repo). The registry only loads modules under `src/graphs`,
hence this one-line re-export.
"""

from src.agents.open_gen_ui_advanced_agent import graph  # noqa: F401
