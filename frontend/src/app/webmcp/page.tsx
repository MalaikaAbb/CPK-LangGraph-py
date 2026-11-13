// Ported from the CPK-LangGraph-TS harness (PR #24), itself from aws-strands-ts
// (same framework-neutral WebMCP page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python/webmcp on 2026-11-09 and identical).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const DIR = "frontend/src/app/webmcp/_demo";

export default function Page() {
  return (
    <>
      <RouteHeader path="/webmcp" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A frontend tool with <code>webmcp</code> set is also published to{" "}
          <code>document.modelContext</code>, so a WebMCP-aware browser agent
          can discover and call the same handler the CopilotKit agent uses. The
          second snippet registers the tool on a bare{" "}
          <code>CopilotKitCore</code>, with no provider, runtime or agent.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Which of my orders have shipped?",
              "(Chrome 149+, WebMCP flag) Call searchOrders with status \"open\" from the Model Context Tool Inspector.",
            ]}
            expect="In any browser: the CopilotKit agent calls searchOrders and lists A-1002 and A-1004. In a WebMCP browser: the inspector lists searchOrders with its schema and readOnlyHint and returns the open order A-1001. On the core-only page, the button returns the two shipped orders."
            fail="If the inspector shows no tool in a browser that should support WebMCP, check the flag or origin trial; otherwise the description or the webmcp option did not reach the registry."
          />
        </div>
      </Panel>

      <Callout tone="info" title="The webmcp option needs CopilotKit 1.71+">
        <p>
          WebMCP support first shipped in <code>@copilotkit/react-core</code> /{" "}
          <code>@copilotkit/core</code> 1.71. Since the bump to 1.85 the
          page&apos;s <code>webmcp: {"{ annotations }"}</code> type-checks
          without a suppression and reaches the registry; whether it mirrors
          onto <code>document.modelContext</code> still depends on a
          WebMCP-capable browser (Chrome 149+ with the flag). Not yet
          re-checked in a browser. See README §9 item 37.
        </p>
      </Callout>

      <Panel title="The code — as published">
        <SourceCodeGroup
          files={[{ file: `${DIR}/OrderSearch.tsx` }, { file: `${DIR}/webmcp.ts` }]}
          note="Each file is the page's snippet with one added import line: the repo-authored searchOrders stub."
        />
      </Panel>

      <Panel title="Harness around it">
        <SourceCodeGroup
          files={[
            { file: `${DIR}/search-orders.ts` },
            { file: "frontend/src/app/webmcp/demo-chat/page.tsx" },
            { file: "frontend/src/app/webmcp/demo-chat/core-only/page.tsx" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Written in">
        <ul className="space-y-1.5">
          <li>
            · <code>searchOrders(status)</code> is called by both snippets and
            defined by neither. <code>search-orders.ts</code> returns four fixed
            orders.
          </li>
          <li>
            · The page needs no backend agent. The <code>webmcp</code> agent is
            Quickstart-shaped and exists only so the chat path can be tried on
            the same page.
          </li>
          <li>
            · The core-only snippet is loaded on its own page so its{" "}
            <code>CopilotKitCore</code> does not register a second{" "}
            <code>searchOrders</code> beside the provider&apos;s.
          </li>
        </ul>
      </Callout>
    </>
  );
}
