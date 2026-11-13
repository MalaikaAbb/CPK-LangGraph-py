// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/from-a2ui/demo-chat";

const BEFORE_PROVIDER = `<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>`;
const AFTER_PROVIDER = `<CopilotKitProvider runtimeUrl="/api/copilotkit" generativeUI={{ ui: appUI }}>`;
const RUNTIME_BEFORE = `const runtime = new CopilotRuntime({
  agents,
  a2ui: { injectA2UITool: false, agents: ["shop"] },
});`;
const RUNTIME_AFTER = `// Nothing: a run that carries a catalog gets the render_ui tool and the guide.
// To force or limit it: generativeUI: true, or generativeUI: { agents: ["shop"] }.
const runtime = new CopilotRuntime({ agents });`;
const CATALOG_BEFORE = `import { createCatalog, DynamicStringSchema } from "@copilotkit/a2ui-renderer";

const definitions = {
  Airport: {
    props: z.object({ code: DynamicStringSchema, city: DynamicStringSchema }),
  },
  Arrow: { props: z.object({}) },
};
const renderers = { Airport, Arrow };
export const myCatalog = createCatalog(definitions, renderers, {
  catalogId: "acme/flights",
  includeBasicCatalog: true,
});`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/from-a2ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The migration from the <code>a2ui</code> renderer (A2UI v0.9) to
          components and surfaces (A2UI 1.0). The provider takes a{" "}
          <code>ui</code> instead of a <code>catalog</code>; the runtime drops
          its A2UI option; each component becomes one entry with a description
          and plain prop types, because the engine resolves bindings before the
          component renders. The demo runs the &ldquo;After&rdquo; catalog.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Show a flight card from SFO (San Francisco) to JFK (New York) with a Book button"]}
            expect="Two Airport components (code, city underneath) with an Arrow between them, inside standard layout components, and a standard Button."
            fail="A text answer, or a rejection naming a v0.9 shape — the agent wrote { path } bindings or an old action, which the 1.0 engine refuses."
          />
        </div>
      </Panel>

      <Panel title="The After catalog, as published">
        <SourceCode file={`${BASE}/app-ui.ts`} />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup files={[{ file: `${BASE}/page.tsx` }]} />
      </Panel>

      <Panel title="Published but not run" description="The before/after pairs. The Before side is the A2UI fixed/dynamic-schema routes' territory.">
        <div className="space-y-4">
          <CodeBlock code={BEFORE_PROVIDER} filename="Before" language="tsx" />
          <CodeBlock code={AFTER_PROVIDER} filename="After" language="tsx" />
          <CodeBlock code={RUNTIME_BEFORE} filename="Runtime, before" language="ts" />
          <CodeBlock code={RUNTIME_AFTER} filename="Runtime, after" language="ts" />
          <CodeBlock code={CATALOG_BEFORE} filename="Convert a custom catalog — Before" language="ts" />
        </div>
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · The After catalog uses <code>z</code>, <code>Airport</code> and{" "}
            <code>Arrow</code> without imports or definitions; added as
            scaffolding.
          </li>
          <li>
            · &ldquo;Runtime, after&rdquo; is <code>new CopilotRuntime(
            {"{ agents }"})</code>; the shared{" "}
            <code>/api/copilotkit-genui</code> runtime has no A2UI option either,
            so it stands in.
          </li>
          <li>
            · The support matrix says agent tools built with{" "}
            <code>@ag-ui/a2ui-toolkit</code> 0.0.5 write v0.9 operations and are
            not supported. That is the toolkit version this repo&apos;s A2UI
            fixed-schema agent (from the published <code>agent.ts</code>) uses,
            so its <code>display_flight</code> surfaces cannot move to this
            engine as published.
          </li>
          <li>
            · The Before catalog is shown only: running it belongs to the A2UI
            routes and needs the zod-3 scoping those routes use.
          </li>
        </ul>
      </Callout>
    </>
  );
}
