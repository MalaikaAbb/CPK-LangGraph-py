"""`genui` — the agent behind every Components and surfaces route.

https://docs.copilotkit.ai/langgraph-python/generative-ui/components
(and surfaces, catalogs, standard-catalog, state-and-actions, theming,
transports, markdown-mode, from-a2ui)

**Repo-authored, not from the docs.** The nine pages are framework-neutral:
their runtime sample is a TanStack `BuiltInAgent` factory (overview) or
"change nothing on the runtime", and the `render_ui` tool plus its catalog
guide arrive per run from the provider. For a LangGraph graph that means:
expose the run's frontend tools (where `render_ui` lands) and put the run's
context entries (where the guide lands) into the prompt. `CopilotKitMiddleware`
does both, the same way the Frontend Tools and Readables routes rely on it, so
this is the docs' ordinary `create_agent` shape plus one backend tool.

The first sentence of the prompt is the Components overview page's own system
prompt. The rest, and `search_products`, are ported from the CPK-LangGraph-TS
harness (`backend/src/agents/genui.ts`, itself from aws-strands-ts
`genui-tools.ts`), because the Catalogs and Surfaces pages ask the model to copy
values from a product search that no page publishes.
"""

from __future__ import annotations

from typing import Optional

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import ChatOpenAI

from copilotkit import CopilotKitMiddleware

from src.graphs._shared import MODEL, checkpointer


#region search-products
# Ported from CPK-LangGraph-TS genui.ts (same products, same filter).
PRODUCTS = [
    {"productId": "p1", "name": "Trail Runner", "price": 120, "imageUrl": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=320&h=200&fit=crop", "tags": ["running", "shoes", "trail"]},
    {"productId": "p2", "name": "City Sneaker", "price": 85, "imageUrl": "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=320&h=200&fit=crop", "tags": ["shoes", "casual"]},
    {"productId": "p3", "name": "Track Spike", "price": 140, "imageUrl": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=320&h=200&fit=crop", "tags": ["running", "shoes", "track"]},
    {"productId": "p4", "name": "Road Racer Lite", "price": 59, "imageUrl": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=320&h=200&fit=crop", "tags": ["running", "shoes", "road", "cheap"]},
    {"productId": "p5", "name": "Everyday Jogger", "price": 45, "imageUrl": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=320&h=200&fit=crop", "tags": ["running", "shoes", "cheap"]},
    {"productId": "p6", "name": "Wool Running Socks", "price": 18, "imageUrl": "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=320&h=200&fit=crop", "tags": ["running", "socks", "accessories"]},
    {"productId": "p7", "name": "Classic White Mug", "price": 40, "imageUrl": "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=320&h=200&fit=crop", "tags": ["mug", "coffee", "cup", "kitchen"]},
    {"productId": "p8", "name": "Camp Enamel Mug", "price": 28, "imageUrl": "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=320&h=200&fit=crop", "tags": ["mug", "coffee", "cup", "kitchen"]},
    {"productId": "p9", "name": "Tall Ceramic Mug", "price": 35, "imageUrl": "https://images.unsplash.com/photo-1570784332176-fdd73da66f03?w=320&h=200&fit=crop", "tags": ["mug", "coffee", "cup", "kitchen"]},
    {"productId": "p10", "name": "Cozy Tea Mug", "price": 22, "imageUrl": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=320&h=200&fit=crop", "tags": ["mug", "coffee", "cup", "kitchen"]},
]


@tool
def search_products(query: str = "", maxPrice: Optional[float] = None) -> dict:
    """Search the shop's products. Returns productId, name, price (USD) and imageUrl for each match.

    Args:
        query: Words to match, e.g. 'running shoes'. Empty returns everything.
        maxPrice: Only return products at or below this price.
    """
    words = [w for w in query.lower().split() if w]

    def matches(p: dict) -> bool:
        if maxPrice is not None and p["price"] > maxPrice:
            return False
        return all(
            any(t.startswith(w.rstrip("s")) for t in p["tags"]) or w in p["name"].lower()
            for w in words
        )

    return {
        "products": [
            {k: v for k, v in p.items() if k != "tags"} for p in PRODUCTS if matches(p)
        ]
    }
#endregion


#region agent
SYSTEM_PROMPT = (
    "You are a helpful assistant. When a visual answer helps, render it with generative UI. "
    "When the user asks about products, call `search_products` first and copy its values into the props the component declares; "
    "leave out any value the component has no prop for. "
    "Use it only for products: render charts and other data yourself, and never give up on the rest of a request because a search came back empty. "
    "In `render_ui` operations, put each prop directly on the component node next to `id` and `component`; never nest props under a `props` key."
)

graph = create_agent(
    model=ChatOpenAI(model=MODEL, temperature=0),
    tools=[search_products],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
    checkpointer=checkpointer(),
)
#endregion
