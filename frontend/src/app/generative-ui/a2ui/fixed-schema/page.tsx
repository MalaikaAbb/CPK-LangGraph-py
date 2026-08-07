import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const RUNTIME = `// app/api/copilotkit/route.ts
const runtime = new CopilotRuntime({
  agents: { "a2ui-fixed-schema": agent },
  a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] },
});

// app/page.tsx — a catalog on the provider is what enables A2UI
<CopilotKit runtimeUrl="/api/copilotkit" a2ui={{ catalog: myCatalog }}>
  {children}
</CopilotKit>`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/fixed-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A surface whose component tree is designed once, by hand, and stored
          as JSON next to the agent. The tool supplies only the four data
          fields; the schema does everything else. Nothing is generated at
          runtime, so the card paints the instant the tool returns.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The doc classifies langgraph-python as a <em>schema-loading</em>{" "}
          integration: <code>a2ui.load_schema(path)</code> parses the file once
          at import. Other integrations declare the tree inline or generate it
          per request — same result, different delivery.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Find me a flight from SFO to JFK."]}
            expect="An itinerary card with both airport codes, an arrow between them, an airline badge, a price and a Book button — and one short sentence of prose, not a repeat of the details."
            fail="Raw JSON in the chat. The catalogId on the provider does not match the one the tool puts in createSurface."
          />
        </div>
      </Panel>

      <Panel title="The schema">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Components without data bindings carry their value inline;{" "}
          <code>Airport</code>, <code>AirlineBadge</code> and{" "}
          <code>PriceTag</code> reference the data model by JSON Pointer (
          <code>{'{ "path": "/origin" }'}</code>). The binder resolves those
          paths <em>before</em> the React renderer runs, which is why the
          renderer props are typed as plain resolved values.
        </p>
        <SourceCode file="backend/src/graphs/a2ui_schemas/flight_schema.json" />
      </Panel>

      <Panel title="The tool">
        <SourceCode file="backend/src/graphs/a2ui_fixed.py" region="tool" />
      </Panel>

      <Panel title="The catalog — definitions">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/definitions.ts" />
      </Panel>

      <Panel title="The catalog — renderers">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/a2ui/renderers.tsx" />
      </Panel>

      <Panel title="Wiring it up">
        <CodeBlock code={RUNTIME} language="tsx" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          A catalog on the provider auto-injects the <code>generate_a2ui</code>{" "}
          tool by default, which is right for{" "}
          <a
            href="/generative-ui/a2ui/dynamic-schema"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            dynamic schemas
          </a>{" "}
          and wrong here — this agent already owns <code>display_flight</code>.
          Turning injection off leaves the middleware still detecting the
          operations and rendering the surface, with no subagent involved.
        </p>
        <SourceCode file="frontend/src/app/generative-ui/a2ui/fixed-schema/demo-chat/page.tsx" />
      </Panel>

    
    </>
  );
}
