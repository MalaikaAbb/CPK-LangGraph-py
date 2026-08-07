"""Backing graph for Programmatic Control's headless interrupt resolver.

https://docs.copilotkit.ai/langgraph-python/programmatic-control

The page's `interrupt-headless` cell drives an interrupt to completion with no
chat picker and no `useInterrupt` — a hand-rolled hook subscribes to
`on_interrupt` custom events and resumes with
`copilotkit.runAgent({ agent, forwardedProps: { command: { resume, interruptEvent } } })`.

The frontend half is printed in full. The graph behind it is not, but the page
pins down its contract exactly: the hook types the payload as
`{ topic?: string; attendee?: string; slots?: TimeSlot[] }` and reads
`event.name === "on_interrupt"`. This graph interrupts with that shape. See
README §9.

The candidate slots are the same fixed list the Human-in-the-Loop page owns on
the frontend ("this is just data the demo page owns, so you can swap in real
availability"). Here they sit on the backend because the interrupt payload is
what carries them to the client.
"""

from __future__ import annotations

from typing import Any

#region agent
from langchain_core.messages import SystemMessage
from langchain_core.runnables import RunnableConfig
from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, StateGraph
from langgraph.types import interrupt

from copilotkit import CopilotKitState

from src.graphs._shared import MODEL, checkpointer

#: Candidate slots, mirroring the HITL page's `DEFAULT_SLOTS`.
SLOTS = [
    {"label": "Tomorrow 10:00 AM", "iso": "2026-04-19T10:00:00-07:00"},
    {"label": "Tomorrow 2:00 PM", "iso": "2026-04-19T14:00:00-07:00"},
    {"label": "Monday 9:00 AM", "iso": "2026-04-21T09:00:00-07:00"},
    {"label": "Monday 3:30 PM", "iso": "2026-04-21T15:30:00-07:00"},
]


class AgentState(CopilotKitState):
    chosen_slot: Any


def schedule_node(state: AgentState, config: RunnableConfig):
    if state.get("chosen_slot") is None:
        # Suspends here. The payload reaches the browser as an `on_interrupt`
        # custom event; the page's `useHeadlessInterrupt` buffers it until the
        # run finalizes, then renders a button grid over `slots`.
        state["chosen_slot"] = interrupt(
            {
                "topic": "Intro call",
                "attendee": "the sales team",
                "slots": SLOTS,
            }
        )

    system_message = SystemMessage(
        content=(
            "You are a scheduling assistant. The user just picked this slot: "
            f"{state.get('chosen_slot')}. Confirm it in one short sentence."
        )
    )
    response = ChatOpenAI(model=MODEL).invoke(
        [system_message, *state["messages"]], config
    )

    return {"chosen_slot": state.get("chosen_slot"), "messages": response}


builder = StateGraph(AgentState)
builder.add_node("schedule_node", schedule_node)
builder.add_edge(START, "schedule_node")
builder.add_edge("schedule_node", END)
graph = builder.compile(checkpointer=checkpointer())
#endregion
