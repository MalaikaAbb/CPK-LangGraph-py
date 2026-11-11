// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/theming/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/theming" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Standard components read their colors, radii, shadows and fonts from{" "}
          <code>--a2ui-*</code> CSS variables. The provider&apos;s{" "}
          <code>theme</code> sets them (typed, so a misspelt name fails{" "}
          <code>tsc</code>), a nested <code>dark</code> block overrides values in
          dark mode, and the same variables can be set in plain CSS on{" "}
          <code>.a2ui-surface</code>.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={["Show a card with a primary button, a slider, and a bar chart of three months"]}
            expect="On every variant except Map style, the button and slider use the amber #d97706 accent; Provider theme also uses Inter and 10px radii. Toggle dark: on Colors per mode the card panel turns #1f2937."
            fail="Default blue accent on Provider theme — the theme never reached the surface."
          />
          <TryIt
            prompts={["(Map style) show the Eiffel Tower on a map"]}
            expect="The map fails to draw a basemap: the page's mapStyle URLs are placeholders. That is the published sample, not a harness fault."
          />
        </div>
      </Panel>

      <Panel title="The page's code">
        <SourceCodeGroup
          files={[
            { file: `${BASE}/themes.tsx` },
            { file: `${BASE}/theme.ts` },
            { file: `${BASE}/dark-mode.tsx` },
            { file: `${BASE}/theming.css` },
          ]}
        />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup files={[{ file: `${BASE}/page.tsx` }]} />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · Only the first sample is a whole <code>generativeUI</code> value;
            the rest are bare <code>theme:</code> fragments. Each is wrapped with{" "}
            <code>ui: standardUI</code>.
          </li>
          <li>
            · The <code>colorSchemeScript</code> belongs in{" "}
            <code>&lt;head&gt;</code>. The harness layout is shared, so it renders
            in the demo body and only runs on a full page load.
          </li>
          <li>
            · <code>theming.css</code> is global once loaded, so its accent can
            leak to other routes until a reload.
          </li>
          <li>
            · The map style URLs (<code>tiles.example.com</code>) are
            placeholders and do not resolve.
          </li>
        </ul>
      </Callout>
    </>
  );
}
