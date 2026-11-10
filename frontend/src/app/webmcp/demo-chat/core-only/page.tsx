"use client";

// Ported from the CPK-LangGraph-TS harness (PR #24), itself from aws-strands-ts
// (same framework-neutral WebMCP page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python/webmcp on 2026-11-09 and identical).

import Link from "next/link";
import { useEffect, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";


/**
 * "WebMCP only, with no agent": loads the page's `webmcp.ts` module, whose
 * module-level `CopilotKitCore` registers `searchOrders` with no runtime and
 * no agent. Loaded on demand so the core instance exists only on this page.
 * The handler-test button is harness glue.
 */
export default function Page() {
  const [loaded, setLoaded] = useState(false);
  const [result, setResult] = useState<string>();

  useEffect(() => {
    import("../../_demo/webmcp").then(() => setLoaded(true));
  }, []);

  async function callHandler() {
    const { copilotkit } = await import("../../_demo/webmcp");
    const tool = copilotkit.getTool({ toolName: "searchOrders" });
    const output = await tool?.handler?.({ status: "shipped" }, {} as never);
    setResult(String(output));
  }

  return (
    <DemoFrame parentPath="/webmcp" subtitle="CopilotKitCore · no agent">
      <div className="flex h-full flex-col">
        <div className="space-y-3 p-4 text-sm">
          <p>
            Core instance {loaded ? "created" : "loading…"}.{" "}
            <Link href="/webmcp/demo-chat" className="text-[var(--accent)] underline underline-offset-4">
              ← Back to the React frontend tool
            </Link>
          </p>
          <button type="button" onClick={callHandler} className="rounded border px-3 py-1 text-xs">
            Call the registered handler with status: &quot;shipped&quot;
          </button>
          {result && <pre className="rounded bg-slate-100 p-2 text-xs dark:bg-slate-900">{result}</pre>}
        </div>
      </div>
    </DemoFrame>
  );
}
