import os
from fastapi import FastAPI
import uvicorn
from copilotkit import LangGraphAGUIAgent
from ag_ui_langgraph import add_langgraph_fastapi_endpoint
from sample_agent.agent import graph # the coagents-starter path, replace this if its different

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

add_langgraph_fastapi_endpoint(
  app=app,
  agent=LangGraphAGUIAgent(
    name="sample_agent", # the name of your agent defined in langgraph.json
    description="Describe your agent here, will be used for multi-agent orchestration",
    graph=graph, # the graph object from your langgraph import
  ),
  path="/your-agent-path", # the endpoint you'd like to serve your agent on
)

# add new route for health check
@app.get("/health")
def health():
    """Health check."""
    return {"status": "ok"}

def main():
    """Run the uvicorn server."""
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(
        "sample_agent.demo:app", # the path to your FastAPI file, replace this if its different
        host="0.0.0.0",
        port=port,
        reload=True,
    )
