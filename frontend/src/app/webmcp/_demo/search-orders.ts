// Ported from the CPK-LangGraph-TS harness (PR #24), itself from aws-strands-ts
// (same framework-neutral WebMCP page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python/webmcp on 2026-11-09 and identical).

/**
 * Repo-authored stub — NOT from the docs. Both WebMCP snippets call
 * `searchOrders(status)`, which the page never defines. Returns a few fixed
 * orders so the tool has a result to hand back, from either caller.
 */
const ORDERS = [
  { id: "A-1001", item: "Trail Runner", status: "open" },
  { id: "A-1002", item: "City Sneaker", status: "shipped" },
  { id: "A-1003", item: "Wool Running Socks", status: "delivered" },
  { id: "A-1004", item: "Track Spike", status: "shipped" },
] as const;

export async function searchOrders(status: "open" | "shipped" | "delivered") {
  return ORDERS.filter((order) => order.status === status);
}
