// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/standard-catalog/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/standard-catalog" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>standardUI</code> is a ready-made catalog of 69 components —
          layout, text, inputs, tables, charts, maps, media. You can use it as
          is, put your own components on top with <code>extends</code>, trim it
          with <code>omit</code> so the prompt is shorter, or swap the React
          component behind a standard name with <code>overrides</code>.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={["Show the Eiffel Tower and the Louvre on a map"]}
            expect="standardUI: a MapLibre map with two markers. omit variant: no map — the agent uses a list or text, because Map was dropped from what it sees."
            fail="On standardUI, a plain list of places means maplibre-gl did not load."
          />
          <TryIt
            prompts={["Put a short summary of our three plans in a card"]}
            expect="On the override variant the card has the large rounded corners and padding of MyCard; on standardUI it has the default card look."
          />
        </div>
      </Panel>

      <Panel title="The page's catalogs">
        <SourceCodeGroup
          files={[
            { file: `${BASE}/extend.ts` },
            { file: `${BASE}/omit.ts` },
            { file: `${BASE}/override.tsx` },
          ]}
        />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup files={[{ file: `${BASE}/page.tsx` }]} />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · &ldquo;Add your own components&rdquo; uses <code>ProductCard</code>{" "}
            and <code>productSchema</code> without defining them — scaffolding
            supplies both.
          </li>
          <li>
            · &ldquo;Drop components&rdquo; omits its imports; added, marked in
            the file.
          </li>
          <li>
            · The same id <code>acme/app@1</code> is used by all three samples;
            each lives in its own file and only one is mounted at a time.
          </li>
          <li>
            · <code>maplibre-gl</code> is installed, as the page says to for{" "}
            <code>Map</code>.
          </li>
        </ul>
      </Callout>
    </>
  );
}
