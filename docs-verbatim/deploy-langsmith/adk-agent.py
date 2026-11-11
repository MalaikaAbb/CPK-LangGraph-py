from google.adk.agents import Agent
from google.adk.runners import Runner
from saf_sdk.adk import LangsmithSessionService, wrap

agent = wrap(
    Runner(
        agent=Agent(
            name="my_agent",
            model="gemini-3.8-flash",
            instruction="You are a helpful assistant.",
        ),
        app_name="my_adk_agent",
        session_service=LangsmithSessionService(),
    )
)
