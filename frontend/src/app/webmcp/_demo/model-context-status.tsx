"use client";

// Ported from the CPK-LangGraph-TS harness (PR #24), itself from aws-strands-ts
// (same framework-neutral WebMCP page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python/webmcp on 2026-11-09 and identical).

import { useSyncExternalStore } from "react";

/**
 * Harness glue — NOT from the docs. Reports whether this browser exposes
 * `document.modelContext`. Without it CopilotKit skips WebMCP registration
 * silently, so the chat path still works but no browser agent can see the
 * tool.
 */
export function ModelContextStatus() {
  const available = useSyncExternalStore(
    () => () => {},
    () => Boolean((document as { modelContext?: unknown }).modelContext),
    () => null,
  );

  if (available === null) return null;
  return (
    <p
      className={`shrink-0 border-b px-4 py-1.5 text-xs ${
        available
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
          : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
      }`}
    >
      {available
        ? "document.modelContext is available: searchOrders is published to WebMCP. Check it in Chrome's Model Context Tool Inspector."
        : "document.modelContext is not available in this browser (needs Chrome 149+ with the WebMCP flag or origin trial). Registration is skipped; the CopilotKit chat path still works."}
    </p>
  );
}
