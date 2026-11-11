"""Registry wrapper for the hashbrown Declarative page's agent.

https://docs.copilotkit.ai/langgraph-python/generative-ui/hashbrown

The agent itself is the page's demo Code tab file, kept at the doc's own path
`backend/src/agents/byoc_hashbrown_agent.py` (verbatim except model and
checkpointer, as everywhere in this repo). The registry only loads modules
under `src/graphs`, hence this one-line re-export.
"""

from src.agents.byoc_hashbrown_agent import graph  # noqa: F401
