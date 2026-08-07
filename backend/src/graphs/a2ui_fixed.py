"""Backing graph for Fixed Schema A2UI.

https://docs.copilotkit.ai/langgraph-python/generative-ui/a2ui/fixed-schema

Reproduced as printed. The page tags langgraph-python as a "schema-loading"
integration, meaning the component tree is authored as JSON next to the agent
and parsed once at import; the tool supplies only the four data fields.

`a2ui.load_schema` and `a2ui.render` come from `copilotkit.a2ui`. Note that the
page writes `from copilotkit import CopilotKitMiddleware, a2ui` — that works,
but only because Python falls back to submodule import: `a2ui` is not in
`copilotkit.__all__` and `hasattr(copilotkit, "a2ui")` is False until something
imports it. Harmless, but it means `import copilotkit; copilotkit.a2ui.render(…)`
raises `AttributeError`. See README §9.

**What is not here.** The page's `flight_schema.json` and `booked_schema.json`
are loaded but never printed on any page, so both are this repo's, written to
the component tree the page diagrams:

    Card
     └─ Column
         ├─ Title        ("Flight Details")
         ├─ Row          (Airport → Arrow → Airport)
         ├─ Row          (AirlineBadge · PriceTag)
         └─ Button       (Book)

`booked_schema.json` is loaded and deliberately unused: the swap it exists for
needs `action_handlers=` on `a2ui.render`, which the Python SDK does not yet
accept (confirmed against copilotkit 0.1.94 — `render(operations)` is the whole
signature). The Book button is therefore inert. Both facts are the page's own
admissions, restated in README §9.
"""

from __future__ import annotations

#region schema
from pathlib import Path
from typing import TypedDict

from copilotkit import CopilotKitMiddleware, a2ui
from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

from src.graphs._shared import MODEL, checkpointer

CATALOG_ID = "copilotkit://flight-fixed-catalog"
SURFACE_ID = "flight-fixed-schema"

_SCHEMAS_DIR = Path(__file__).parent / "a2ui_schemas"

# The schema is JSON so it can be authored and reviewed independently of the
# Python code. `a2ui.load_schema` is just a thin `json.load` wrapper.
FLIGHT_SCHEMA = a2ui.load_schema(_SCHEMAS_DIR / "flight_schema.json")

# Loaded and currently unused — kept ready for the button-click "booked" swap
# the moment `a2ui.render` grows an `action_handlers=` kwarg.
BOOKED_SCHEMA = a2ui.load_schema(_SCHEMAS_DIR / "booked_schema.json")
#endregion


#region tool
class Flight(TypedDict):
    """Shape the LLM should fill in when calling `display_flight`.

    LangGraph serializes this TypedDict into the tool's JSON schema, so
    defining it narrowly is how we steer the LLM to produce data that fits
    the frontend `FlightCard` component's props.
    """

    origin: str
    destination: str
    airline: str
    price: str


@tool
def display_flight(origin: str, destination: str, airline: str, price: str) -> str:
    """Show a flight card for the given trip.

    Use short airport codes (e.g. "SFO", "JFK") for origin/destination and a
    price string like "$289".

    After this tool returns, the flight card is already rendered to the user
    via the A2UI surface — the JSON returned here is the surface descriptor
    the renderer consumes, NOT a status code. Do NOT call this tool again
    for the same flight (the user already sees the card). Reply with one
    short confirmation sentence and stop.
    """
    # The A2UI middleware detects the `a2ui_operations` container in this
    # tool result and forwards the ops to the frontend renderer. The frontend
    # catalog resolves component names to the local React components.
    #
    # Note: schema-swap-on-action (e.g. swapping to a "booked" schema when
    # the card's button is clicked) will be added once the Python SDK
    # exposes `action_handlers=` on `a2ui.render`.
    return a2ui.render(
        operations=[
            a2ui.create_surface(SURFACE_ID, catalog_id=CATALOG_ID),
            a2ui.update_components(SURFACE_ID, FLIGHT_SCHEMA),
            a2ui.update_data_model(
                SURFACE_ID,
                {
                    "origin": origin,
                    "destination": destination,
                    "airline": airline,
                    "price": price,
                },
            ),
        ],
    )
#endregion


#region agent
graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[display_flight],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "You help users find flights. When the user asks about a flight, "
        "call `display_flight` once with plausible details — 3-letter airport "
        "codes, a real airline name, and a price like \"$289\". Default the "
        "origin to SFO if they only name a destination. The card is drawn for "
        "them automatically, so reply with one short sentence and stop."
    ),
    checkpointer=checkpointer(),
)
#endregion
