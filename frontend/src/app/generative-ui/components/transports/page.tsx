// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/transports/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/transports" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same catalog can reach the browser two ways: the agent calls a{" "}
          <code>render_ui</code> tool the runtime adds (checked server-side as
          it streams), or it writes <code>a2ui</code> code blocks inside its
          reply (checked in the browser). <code>agentIds</code> limits which
          agents get any of it, and the runtime&apos;s{" "}
          <code>generativeUI</code> option controls when the tool is added.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={["Compare the Starter, Team, and Enterprise plans in a table"]}
            expect="Tool: a table component in its own message. Markdown: prose with the table embedded in the same reply. As shop: a table component. As default: a plain-text or markdown answer — that agent got no catalog and no guide."
            fail="The 'as default' variant renders a component — agentIds was ignored."
          />
        </div>
      </Panel>

      <Panel title="The runtime" description="The page's CopilotRuntime sample, with the shop agent added as harness glue.">
        <SourceCode file="frontend/src/app/api/copilotkit-genui-transports/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="The provider configs and demo">
        <SourceCodeGroup files={[{ file: `${BASE}/configs.ts` }, { file: `${BASE}/page.tsx` }]} />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · The runtime sample references an <code>agent</code> it never
            builds; this repo&apos;s <code>genui</code> LangGraph graph is used
            through <code>buildAgents</code> (HttpAgent under FastAPI,
            LangGraphAgent under <code>langgraph dev</code>).
          </li>
          <li>
            · The <code>shop</code> agent id comes from the &ldquo;Only some
            agents&rdquo; sample&apos;s <code>agentIds</code>; it is added to the
            runtime so there is an agent inside the list and one outside it.
          </li>
          <li>
            · The runtime sample sets no <code>runner</code>; it gets the
            runtime&apos;s default in-memory runner.
          </li>
        </ul>
      </Callout>
    </>
  );
}
