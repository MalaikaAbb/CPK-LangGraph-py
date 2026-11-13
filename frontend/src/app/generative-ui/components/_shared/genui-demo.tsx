"use client";

// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { CopilotChat, CopilotKitProvider } from "@copilotkit/react-core/v2";
import type { GenerativeUIConfig } from "@copilotkit/react-core/v2/generative-ui";
import { useState, type ReactNode } from "react";

/**
 * Harness chrome shared by the Components and surfaces demos.
 *
 * Each page's provider config differs (catalog, transport, theme, error
 * boundary), and several pages publish more than one. A variant is one config;
 * picking a variant remounts the provider under a new `key`, so the chat,
 * the surfaces and the catalog all start clean for it.
 *
 * Every provider here points at `/api/copilotkit-genui` (or the Transports
 * route): the doc's runtime, mounted beside the harness's main one.
 */

export const GENUI_RUNTIME_URL = "/api/copilotkit-genui";

export interface Variant {
  id: string;
  label: string;
  /** What this variant changes, shown above the demo. */
  note?: ReactNode;
  generativeUI?: GenerativeUIConfig;
  runtimeUrl?: string;
  agentId?: string;
  /** Page content outside the chat: surfaces, app state, etc. */
  page?: ReactNode;
  /** Replaces the chat entirely (for variants with nothing to send). */
  noChat?: boolean;
  welcome?: string;
}

export function GenUIDemo({ variants }: { variants: Variant[] }) {
  const [current, setCurrent] = useState(variants[0]);

  return (
    <div className="flex h-full flex-col">
      {variants.length > 1 && (
        <div className="shrink-0 space-y-1 border-b border-slate-200 p-2 dark:border-slate-800">
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setCurrent(v)}
                className={`rounded-md border px-3 py-1 text-xs font-medium ${
                  current.id === v.id
                    ? "border-[var(--accent)] text-[var(--accent)]"
                    : "border-slate-300 text-slate-600 dark:border-slate-600 dark:text-slate-300"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      )}
      {current.note && (
        <p className="shrink-0 border-b border-slate-200 px-3 py-1.5 text-xs text-slate-500 dark:border-slate-800">
          {current.note}
        </p>
      )}

      <div className="min-h-0 flex-1">
        <CopilotKitProvider
          key={current.id}
          runtimeUrl={current.runtimeUrl ?? GENUI_RUNTIME_URL}
          {...(current.generativeUI ? { generativeUI: current.generativeUI } : {})}
        >
          <div className="flex h-full">
            {current.page && (
              <div className="min-w-0 flex-1 overflow-y-auto p-4">{current.page}</div>
            )}
            {!current.noChat && (
              <div
                className={`min-h-0 ${current.page ? "w-[28rem] shrink-0 border-l border-slate-200 dark:border-slate-800" : "flex-1"}`}
              >
                <CopilotChat
                  {...(current.agentId ? { agentId: current.agentId } : {})}
                  labels={{
                    welcomeMessageText:
                      current.welcome ?? "Ask for something visual.",
                  }}
                />
              </div>
            )}
          </div>
        </CopilotKitProvider>
      </div>
    </div>
  );
}
