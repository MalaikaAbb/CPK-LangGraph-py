"""The FastAPI transport — one of the Quickstart's two deployment tabs.

<https://docs.copilotkit.ai/langgraph-python/quickstart?agent=bring-your-own>
(FastAPI tab)

The Quickstart mounts a single graph at `/`:

    add_langgraph_fastapi_endpoint(
      app=app,
      agent=LangGraphAGUIAgent(
        name="sample_agent",
        description="An example agent to use as a starting point for your own agent.",
        graph=graph,
      ),
      path="/",
    )

This harness has one graph per doc route, so the same call runs once per
registered id with `path=f"/{agent_id}"`. `frontend/src/app/api/copilotkit/
route.ts` then points one `LangGraphHttpAgent` at each of those paths.

The sibling transport is `langgraph.json` + `langgraph dev`; see README §3 for
why both exist and how to switch. Nothing in `src/graphs/` knows which one is
running except `_shared.checkpointer()`.

Run with:  cd backend && uv run --env-file .env python main.py
"""

from __future__ import annotations

import logging
import os

import uvicorn
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from dotenv import load_dotenv
from fastapi import FastAPI

from copilotkit import LangGraphAGUIAgent

load_dotenv()

from src.graphs.registry import REGISTRY, load  # noqa: E402  (after load_dotenv)

logging.basicConfig(level=os.environ.get("LOG_LEVEL", "INFO"))
logger = logging.getLogger(__name__)

HOST = os.environ.get("AGENT_HOST", "0.0.0.0")
PORT = int(os.environ.get("AGENT_PORT", "8123"))

app = FastAPI(
    title="CopilotKit + LangGraph (Python) test suite — agent server",
    description="One AG-UI endpoint per doc route.",
)


#region mount
for agent_id, registered in REGISTRY.items():
    add_langgraph_fastapi_endpoint(
        app=app,
        agent=LangGraphAGUIAgent(
            name=agent_id,
            description=f"Backs {registered.doc}",
            graph=load(agent_id),
        ),
        path=f"/{agent_id}",
    )
#endregion


@app.get("/health")
def health() -> dict:
    """Lets the README's smoke test confirm every graph mounted."""
    return {
        "status": "ok",
        "transport": "fastapi",
        "agents": sorted(REGISTRY),
        "count": len(REGISTRY),
    }


def main():
    """Run the uvicorn server."""
    logger.info(
        "Mounted %d graphs: %s", len(REGISTRY), ", ".join(sorted(REGISTRY))
    )
    uvicorn.run(app, host=HOST, port=PORT)


if __name__ == "__main__":
    main()
