// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const TYPE_CHECK = `function ProductCard(props: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  props.price; // number
  props.color; // type error: not a prop of ProductCard
}`;

const EXPORT = `import { exportA2UICatalog } from "@copilotkit/react-core/v2/generative-ui";

const catalog = exportA2UICatalog(appUI, { title: "Acme app" });
fs.writeFileSync("acme-catalog.json", JSON.stringify(catalog, null, 2));`;

const BASE = "frontend/src/app/generative-ui/components/catalogs/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/catalogs" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A catalog is the list the agent may render from: a React component, a
          description, and a props schema per entry. The schema is what the
          model is shown and what types your component, so the two cannot
          drift. The demo has one variant per catalog the page builds, plus the
          export to an A2UI 1.0 catalog definition.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={["Show me three running shoes as product cards"]}
            expect="On shopUI: the agent calls search_products first, then a ProductGrid holding three ProductCards whose name, price and image match that tool result."
            fail="Standard components such as Table or Card appear — they are not in this catalog, so the run should have rejected them."
          />
          <TryIt
            prompts={["Show a hero titled 'Spring sale' and a cart badge with 3 items"]}
            expect="On appUI: the Hero heading and the CartBadge, alongside any standard components — extends merged all three catalogs."
          />
          <TryIt
            prompts={["(Export tab — no prompt)"]}
            expect="The Panel order line reads component, title, children, color, and the JSON lists every standard component plus CartBadge and Hero."
            fail="A different order means parameterOrder is not applied to the export."
          />
        </div>
      </Panel>

      <Panel title="The catalogs, as published">
        <SourceCodeGroup
          files={[
            { file: `${BASE}/catalog.tsx` },
            { file: `${BASE}/combine.tsx` },
            { file: `${BASE}/schema-libraries.tsx` },
            { file: `${BASE}/panel-order.tsx` },
          ]}
        />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup
          files={[{ file: `${BASE}/page.tsx` }, { file: `${BASE}/export-view.tsx` }]}
        />
      </Panel>

      <Panel title="Published but not run" description="A compile-time illustration and a Node-only write.">
        <div className="space-y-4">
          <CodeBlock code={TYPE_CHECK} filename="Type your components — as published" language="tsx" />
          <CodeBlock code={EXPORT} filename="Export the catalog — as published" language="ts" />
        </div>
      </Panel>

      <Panel title="Scaffolding the page does not define">
        <SourceCode file="frontend/src/app/generative-ui/components/_shared/scaffolding.tsx" />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · <strong>Combine catalogs</strong> uses <code>cartUI</code>,{" "}
            <code>Hero</code> and <code>z</code> with no import or definition.
            Supplied as scaffolding (a one-component <code>cartUI</code>, a
            heading <code>Hero</code>).
          </li>
          <li>
            · <strong>Positional parameter order</strong> uses{" "}
            <code>createGenerativeUI</code>, <code>z</code> and{" "}
            <code>Panel</code> unimported; its <code>ui</code> is not exported.
            Imports and an export line added, each marked in the file.
          </li>
          <li>
            · <strong>Pick a schema library</strong> prints two{" "}
            <code>props:</code> lines, not a catalog. The catalog around them is
            scaffolding.
          </li>
          <li>
            · <strong>Export</strong> ends in <code>fs.writeFileSync</code>, which
            needs Node; the demo prints the same object in the browser.
          </li>
          <li>
            · <strong>ProductCard&apos;s description</strong> says to copy values
            &ldquo;from a product of a tool result&rdquo;, but no page publishes a
            tool that returns products. The <code>genui</code> agent carries a
            repo-authored <code>search_products</code>{" "}
            (<code>backend/src/agents/genui-tools.ts</code>) so there is a result
            to copy from.
          </li>
        </ul>
      </Callout>
    </>
  );
}
