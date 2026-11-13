"""LangGraph agent backing the In-Chat HITL (useHumanInTheLoop) demo.

The `book_call` tool is defined on the frontend via `useHumanInTheLoop`,
so there is no backend tool here. CopilotKitMiddleware is attached so the
frontend suggestions and the time-picker render hook are picked up.
"""

from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer

graph = create_agent(
    # Page: ChatOpenAI(reasoning_effort="none", model="gpt-6-luna"); redirected
    # to _shared.MODEL (README §9 item 5).
    model=ChatOpenAI(model=MODEL),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "You help users book an onboarding call with the sales team. "
        "When they ask to book a call, call the frontend-provided "
        "`book_call` tool with a short topic and the user's name. "
        "Keep any chat reply to one short sentence."
    ),
    checkpointer=checkpointer(),  # harness: transport-dependent, see _shared
)
