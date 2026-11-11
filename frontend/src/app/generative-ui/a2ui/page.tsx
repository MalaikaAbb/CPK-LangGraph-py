import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * The A2UI overview page. It introduces the two approaches and the two ways to
 * switch A2UI on, which this repo already exercises on the Dynamic Schema and
 * Fixed Schema routes. This route maps the page's snippets onto those working
 * implementations rather than adding a third demo.
 *
 * Ported from the CPK-LangGraph-TS harness's version of this page (PR #21);
 * the snippets were re-checked against the langgraph-python page and match.
 */
export default function Page() {
  const link = "text-[var(--accent)] underline underline-offset-4";
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui" />

      <Panel title="What the page covers">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A2UI surfaces are built from three operations:{" "}
          <code>createSurface</code>, then <code>updateComponents</code> (the
          tree), then <code>updateDataModel</code> (the data, bound through
          JSON Pointer paths). There are two approaches:{" "}
          <Link href="/generative-ui/a2ui/dynamic-schema" className={link}>
            Dynamic Schema
          </Link>{" "}
          (a secondary LLM designs tree and data) and{" "}
          <Link href="/generative-ui/a2ui/fixed-schema" className={link}>
            Fixed Schema
          </Link>{" "}
          (a pre-authored tree, with the agent streaming data only). A2UI can
          be switched on in two ways, and you can recolor the basic catalog
          with CSS variables.
        </p>
      </Panel>

      <Panel
        title="Setup 1 — a catalog on the provider (recommended)"
        description="Enables A2UI and injects generate_a2ui. Exercised by /generative-ui/a2ui/dynamic-schema."
      >
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/a2ui/provider-catalog.tsx" },
            { file: "frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" },
          ]}
          note="Top: the page's snippet. Bottom: this repo's working form of it."
        />
      </Panel>

      <Panel
        title="Setup 2 — enable on the runtime"
        description="The page's no-catalog path turns on injectA2UITool: true. This repo's runtime uses the same a2ui block with injectA2UITool: false for the Fixed Schema graph."
      >
        <SourceCode file="docs-verbatim/a2ui/runtime-no-catalog.ts" />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          See <code>frontend/src/app/api/copilotkit/[[...slug]]/route.ts</code>{" "}
          (<code>a2ui: &#123; injectA2UITool: false, agents: [...] &#125;</code>).
          The exact no-catalog, auto-inject combination the page shows is not
          run by any route here.
        </p>
      </Panel>

      <Callout tone="info" title="The helper snippet runs on the Fixed Schema route">
        <p>
          The page lists the operations through the Python SDK&apos;s{" "}
          <code>copilotkit.a2ui</code> helpers. This repo&apos;s Fixed Schema
          agent (<code>backend/src/graphs/a2ui_fixed.py</code>) calls exactly
          these (<code>create_surface</code>, <code>update_components</code>,{" "}
          <code>update_data_model</code>, <code>render</code>); see README §9
          items 22–23 for their quirks.
        </p>
        <div className="mt-3">
          <SourceCode file="docs-verbatim/a2ui/a2ui_helpers.py" />
        </div>
      </Callout>

      <Panel
        title="Colors and dark mode"
        description="CSS variables on .a2ui-surface; not applied in this repo."
      >
        <SourceCode file="docs-verbatim/a2ui/surface-colors.css" />
      </Panel>
    </>
  );
}
