"use client";

// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import type { GenerativeUIConfig } from "@copilotkit/react-core/v2/generative-ui";

import { DemoFrame } from "@/components/demo-frame";

import { GenUIDemo } from "../../_shared/genui-demo";
import { PRODUCTS } from "../../_shared/scaffolding";
import { shopUI } from "./catalog";
import { FeaturedProducts } from "./featured-products";
import { LimitedFeatured, Recommendations, SidebarNotes } from "./targets";
import "./surfaces.css";

/**
 * "When a component fails" — the page's provider config, verbatim, used for
 * both variants so a broken component shows the page's own fallback.
 */
const generativeUI: GenerativeUIConfig = {
  ui: shopUI,
  errorBoundary: {
    onError: (info) => console.warn(info.kind, info.surfaceId, info.error.message),
    fallback: ({ retry }) => <button onClick={retry}>Try again</button>,
  },
};

export default function DemoPage() {
  return (
    <DemoFrame parentPath="/generative-ui/components/surfaces" subtitle="GenerativeUISurface">
      <GenUIDemo
        variants={[
          {
            id: "page-targets",
            label: "Page targets",
            note: "Three targets on the page: featured (with description + fallback), sidebar-notes (autoScroll off), and one recommendations target per product.",
            generativeUI,
            welcome: "Try: show me cheap running shoes in the featured row.",
            page: (
              <div className="space-y-6">
                <section>
                  <h2 className="mb-2 text-sm font-semibold">Featured products</h2>
                  <FeaturedProducts products={PRODUCTS} />
                </section>
                <section>
                  <h2 className="mb-2 text-sm font-semibold">Product page — recommendations</h2>
                  <Recommendations />
                </section>
                <section>
                  <h2 className="mb-2 text-sm font-semibold">Sidebar notes</h2>
                  <SidebarNotes />
                </section>
              </div>
            ),
          },
          {
            id: "limit",
            label: "Limit the components",
            note: "The featured target with only ui + components — no description, no fallback.",
            generativeUI,
            welcome: "Try: put a table of shoe sizes in the featured area.",
            page: (
              <section>
                <h2 className="mb-2 text-sm font-semibold">featured</h2>
                <LimitedFeatured />
              </section>
            ),
          },
        ]}
      />
    </DemoFrame>
  );
}
