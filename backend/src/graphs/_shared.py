"""Model choice, shared across every graph.

**On the model name.** Roughly twenty snippets across the LangGraph (Python)
docs build their agent with `ChatOpenAI(model="gpt-5.4")`. OpenAI publishes no
such model, so those snippets cannot run as printed — the name is a placeholder
carried over from CopilotKit's internal showcase repo. The one model the docs
actually commit to is on the
[Quickstart](https://docs.copilotkit.ai/langgraph-python/quickstart), whose
`mock_llm` node uses `gpt-4.1-mini`. That is what every agent here uses.

The two reasoning routes are the exception. Reasoning cards only appear when the
model emits `REASONING_MESSAGE_*` events, and `gpt-4.1-mini` never does. Both
reasoning pages name the models that do — o1, o3, o4-mini — so `o4-mini` is the
doc-grounded pick there rather than an invented one.

See README §9 for the full discrepancy list.
"""

from __future__ import annotations

import os

#region models
#: The Quickstart's model. Every non-reasoning graph uses it.
MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")

#: Reasoning Messages and Generative UI → Reasoning both name o1 / o3 / o4-mini
#: as the models that emit reasoning tokens. Without one of these, the reasoning
#: card never renders and those two routes have nothing to show.
REASONING_MODEL = os.environ.get("OPENAI_REASONING_MODEL", "o4-mini")
#endregion


#region transport
#: Which of the Quickstart's two deployment tabs this process is serving.
#:
#: `fastapi`  — `main.py` mounts every graph with `add_langgraph_fastapi_endpoint`.
#: `langsmith` — `langgraph dev` loads every graph named in `langgraph.json`.
#:
#: The only thing it changes inside a graph module is the checkpointer, below.
TRANSPORT = os.environ.get("LANGGRAPH_TRANSPORT", "fastapi").strip().lower()


def checkpointer():
    """The checkpointer for the active transport.

    The Quickstart's two tabs differ here and nowhere else: the FastAPI tab
    compiles `graph.compile(checkpointer=MemorySaver())`, the LangSmith tab
    compiles bare. That is not stylistic — LangGraph Platform supplies and owns
    persistence for every deployed graph, so a graph that brings its own is
    rejected at load time. Under FastAPI nothing else is persisting anything,
    and `interrupt()` cannot resume without a checkpointer at all.

    Returns `None` under the LangSmith transport so the same module serves both.
    """
    if TRANSPORT == "langsmith":
        return None
    from langgraph.checkpoint.memory import MemorySaver

    return MemorySaver()
#endregion
