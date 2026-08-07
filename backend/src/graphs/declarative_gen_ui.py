"""Backing graph for Dynamic Schema A2UI.

https://docs.copilotkit.ai/langgraph-python/generative-ui/a2ui/dynamic-schema

The striking thing about this route is how little backend there is. On the
default path the frontend passes `a2ui={{ catalog: myCatalog }}` to the
provider, and that alone turns A2UI on and injects the `generate_a2ui` tool —
"that is all the default path needs. The catalog auto-enables A2UI and injects
the `generate_a2ui` tool, so the runtime needs no `a2ui` block."

`generate_a2ui` therefore arrives at this graph the same way any frontend tool
does, and `CopilotKitMiddleware` puts it on the model's list. The secondary LLM
that actually designs the surface runs inside that injected tool, runtime-side,
not here. So the graph below is the docs' plain `create_agent` shape with a
prompt that pushes the model toward drawing rather than describing.

**The opt-out path.** The page also documents building the tool yourself with
`ag_ui_langgraph.get_a2ui_tools({...})` and attaching `A2UIMiddleware` — for
when you want no catalog on the provider, or injection off. Not taken here,
because the default path is what the page leads with and what the catalog on
the route's provider already gives us. The route page shows the opt-out snippet
for reference.

Because injection has to be **on** for this route and **off** for the
fixed-schema route (whose agent owns its own `display_flight` tool and must not
also be handed `generate_a2ui`), the two cannot share a runtime endpoint. This
one is served by `/api/copilotkit-declarative-gen-ui`.

**On the anti-drift half of the prompt.** The catalog does reach the model —
`CopilotKitMiddleware.before_agent` injects it as context unconditionally, and
correctly-rendered `Metric` tiles prove the model reads it. But open-ended
generation still drifts: observed failures include emitting a `Title` component
that exists in neither the custom nor the basic catalog (the renderer then shows
"Unknown component: Title"), and giving `PrimaryButton` a `child` instead of a
`label`, which renders an empty button rather than erroring.

The last paragraph of the system prompt below names those two failures directly.
It is this repo's prompt, not the doc's, and it is mitigation rather than a fix —
sampling can always drift again. The deterministic alternative is the
fixed-schema route.
"""

from __future__ import annotations

#region agent
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer

graph = create_agent(
    model=ChatOpenAI(model=MODEL),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=(
        "You build live dashboards. When the user asks to see, build, or "
        "summarize anything with structure — metrics, breakdowns, rankings, "
        "comparisons, status — call the `generate_a2ui` tool and design a "
        "surface for it using the component catalog you are given. Compose "
        "freely: cards, metric tiles, tables and charts side by side. Prefer "
        "drawing the answer over describing it, and do not repeat the "
        "surface's contents back as prose. Reply with one short sentence "
        "once the surface is drawn.\n"
        "\n"
        "Stay inside the catalog. Two rules, both of which the model gets "
        "wrong often enough to be worth stating explicitly:\n"
        "1. Emit ONLY component names that appear in the catalog you were "
        "given. Never invent one. In particular there is no `Title`, "
        "`Heading` or `Header` component — a section title is the `title` "
        "prop on `Card`, and standalone prose is `Text`.\n"
        "2. Use each component's exact prop names from its schema. "
        "`PrimaryButton` takes a `label` string; it has no `child` and no "
        "`text`. Getting this wrong renders an empty control rather than "
        "erroring, so it is easy to miss."
    ),
    checkpointer=checkpointer(),
)
#endregion
