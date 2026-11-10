// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/surfaces/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/surfaces" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Generated UI can land outside the chat. A{" "}
          <code>GenerativeUISurface</code> marks an area of the page as a target
          with an id and a description the agent reads on every run; asking in
          the chat then changes that area. A target can restrict which catalog
          components may go in it, opt out of auto-scroll, or exist once per
          item.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={[
              "Show me cheap running shoes in the featured row",
              "Show the featured products again",
            ]}
            expect="The first prompt replaces the page's own three-product row with an agent-rendered ProductGrid; the second deletes that surface and the fallback row comes back."
            fail="The grid appears in the chat instead of the featured row — the target's description never reached the agent."
          />
          <TryIt
            prompts={["Recommend two related shoes under the Trail Runner"]}
            expect="With Trail Runner selected, a grid fills the recommendations target for that product only. Switch product and the target is empty; switch back and it is still there."
          />
          <TryIt
            prompts={["(Limit tab) Put a table of shoe sizes in the featured area"]}
            expect="The agent cannot use Table there: it is not in this catalog nor in the target's components list, so it either builds ProductCards or explains it cannot."
          />
        </div>
      </Panel>

      <Panel title="The page's code">
        <SourceCodeGroup
          files={[
            { file: `${BASE}/featured-products.tsx` },
            { file: `${BASE}/targets.tsx` },
            { file: `${BASE}/surfaces.css` },
            { file: `${BASE}/catalog.ts` },
          ]}
        />
      </Panel>

      <Panel title="The demo" description="The provider config is the page's 'When a component fails' sample.">
        <SourceCodeGroup files={[{ file: `${BASE}/page.tsx` }]} />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · <code>Product</code>, <code>ProductRow</code> and the products
            list are used by <code>FeaturedProducts</code> but never defined.
            Supplied from <code>_shared/scaffolding.tsx</code>.
          </li>
          <li>
            · <code>./catalog</code> is imported but not printed on this page; it
            is taken to be the Catalogs page&apos;s <code>shopUI</code>, the
            only catalog with ProductGrid and ProductCard.
          </li>
          <li>
            · The one-line targets (<code>sidebar-notes</code>, per-product
            recommendations) are shown without a page around them; the layout and
            the product picker are scaffolding.
          </li>
          <li>
            · No page gives the agent products, and this repo doesn&apos;t add a
            products tool, so the model invents the products it renders.
          </li>
        </ul>
      </Callout>
    </>
  );
}
