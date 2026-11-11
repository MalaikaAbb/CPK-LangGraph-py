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
route.ts` then points one `HttpAgent` (`@ag-ui/client`) at each of those paths.

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
from ag_ui.core.types import RunAgentInput
from ag_ui.encoder import EventEncoder
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

from copilotkit import LangGraphAGUIAgent

load_dotenv()

from src.graphs.registry import REGISTRY, load  # noqa: E402  (after load_dotenv)
from src.graphs.configurable import build_agent as build_configurable_agent  # noqa: E402

#: Graphs served by a hand-written per-request endpoint instead of the loop.
REQUEST_LOCAL_AGENTS = {"configurable"}

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
    if agent_id in REQUEST_LOCAL_AGENTS:
        continue  # mounted per request below
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


#region configurable
# Configurable page (Python tab): graph execution settings are set by the
# trusted backend, on a request-local `LangGraphAGUIAgent` built by the page's
# `build_agent(tenant_id)`. `add_langgraph_fastapi_endpoint` takes one
# pre-built agent, so this route has the shape of the Authentication page's
# self-hosted endpoint instead. Harness glue: there is no auth here, so the
# "tenant resolved after authentication" is a server-side env var. Whatever
# the browser puts in `forwardedProps.config` is never read.
@app.post("/configurable")
async def configurable_endpoint(input_data: RunAgentInput, request: Request):
    encoder = EventEncoder(accept=request.headers.get("accept"))
    tenant_id = os.environ.get("CONFIGURABLE_TENANT_ID", "tenant-demo")
    agent = build_configurable_agent(tenant_id)

    async def event_generator():
        async for event in agent.run(input_data):
            yield encoder.encode(event)

    return StreamingResponse(
        event_generator(), media_type=encoder.get_content_type()
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
