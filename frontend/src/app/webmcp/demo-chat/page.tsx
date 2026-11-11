"use client";

// Ported from the CPK-LangGraph-TS harness (PR #24), itself from aws-strands-ts
// (same framework-neutral WebMCP page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python/webmcp on 2026-11-09 and identical).

import Link from "next/link";
import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { OrderSearch } from "../_demo/OrderSearch";

/**
 * "React frontend tool": the page's `OrderSearch`, mounted inside the app's
 * root `CopilotKitProvider` as the page requires, next to a chat on the
 * `webmcp` agent so the same handler can be called from both sides.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/webmcp" subtitle="agent: webmcp · tool: searchOrders">
      <div className="flex h-full flex-col">
        <p className="shrink-0 border-b border-slate-200 px-4 py-1.5 text-xs text-slate-500 dark:border-slate-800">
          React frontend tool.{" "}
          <Link href="/webmcp/demo-chat/core-only" className="text-[var(--accent)] underline underline-offset-4">
            Switch to the core-only registration (no agent) →
          </Link>
        </p>
        <OrderSearch />
        <div className="chat-host min-h-0 flex-1">
          <CopilotChat agentId="webmcp" />
        </div>
      </div>
    </DemoFrame>
  );
}
