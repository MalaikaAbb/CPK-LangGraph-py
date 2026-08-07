import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const OPT_OUT = `// The opt-out path, if you do not pass a catalog on the provider.
// 1. Attach the middleware that turns a2ui_operations into surfaces:
import { A2UIMiddleware } from "@ag-ui/a2ui-middleware";
agent.use(new A2UIMiddleware({ injectA2UITool: false }));

// 2. Build the tool yourself and add it to your agent's tools:
from ag_ui_langgraph import get_a2ui_tools
from langchain_openai import ChatOpenAI

generate_a2ui = get_a2ui_tools({
    "model": ChatOpenAI(model="gpt-4o"),
    "default_catalog_id": "copilotkit://app-dashboard-catalog",
})
tools = [my_other_tool, generate_a2ui]`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/a2ui/dynamic-schema" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The other end of the A2UI spectrum: nothing about the surface is
          decided in advance. A secondary LLM inside the injected{" "}
          <code>generate_a2ui</code> tool designs the schema, the data and the
          layout per request, choosing from the component vocabulary your
          catalog advertises.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Which means the <code>description</code> on each definition is not
          documentation — it is the prompt. The LLM reads those strings to
          decide what to emit, so a vague description produces a component that
          never gets picked, or gets picked wrongly.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Build me a dashboard with revenue, churn and a table of the top 5 customers.",
            ]}
            expect="Cards, metric tiles, a table and a chart assembled into a layout — and a visibly different arrangement if you ask again with different content."
            fail="A wall of JSON in the chat. The middleware is not attached, or the catalog never reached the provider."
          />
        </div>
      </Panel>

      <Panel title="How a surface gets built">
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            The agent calls the A2UI tool, available because{" "}
            <code>injectA2UITool</code> is on.
          </li>
          <li>
            The runtime serialises your catalog — component names plus Zod prop
            schemas — into <code>copilotkit.context</code>, so the LLM knows what
            it may emit.
          </li>
          <li>
            The secondary LLM&apos;s tool call streams through LangGraph as{" "}
            <code>TOOL_CALL_ARGS</code> events.
          </li>
          <li>
            The middleware waits for the full <code>components</code> array,
            emits <code>createSurface</code> + <code>updateComponents</code>,
            then emits one <code>updateDataModel</code> per complete data item —
            which is why cards appear one at a time rather than all at once.
          </li>
        </ol>
      </Panel>

      <Panel title="The catalog — definitions">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/definitions.ts" />
      </Panel>

      <Panel title="The catalog — renderers">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/renderers.tsx" />
      </Panel>

      <Panel title="Wiring the catalog">
        <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/a2ui/catalog.ts" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/generative-ui/a2ui/dynamic-schema/demo-chat/page.tsx" />
        </div>
      </Panel>

      <Panel title="The graph">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Strikingly little. <code>generate_a2ui</code> arrives as a forwarded
          frontend tool like any other, so the backend is the plain{" "}
          <code>create_agent</code> shape with a prompt that pushes the model
          toward drawing rather than describing.
        </p>
        <SourceCode file="backend/src/graphs/declarative_gen_ui.py" region="agent" />
      </Panel>

      <Panel title="If you opt out of auto-inject">
        <CodeBlock code={OPT_OUT} language="tsx" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Not taken on this route — the default path is what the page leads with
          and what the catalog already gives us. Shown because the opt-out is
          what you need if you want A2UI without putting a catalog on the
          provider, and because it makes visible that the &ldquo;secondary
          LLM&rdquo; is a real, separately-modelled call.
        </p>
      </Panel>

      {/* <Callout
        tone="warn"
        title="Expected failure mode: the model drifts outside the catalog"
      >
        <p>
          Open-ended generation is not constrained to the vocabulary you
          advertise — it is only <em>prompted</em> with it. Two drifts seen on
          this route:
        </p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5">
          <li>
            Emitting a <code>Title</code> component. It exists in neither the
            custom catalog nor the basic one, so the renderer shows{" "}
            <code>Unknown component: Title</code> — that message is the
            renderer&apos;s designed guard, not a crash. A section title is the{" "}
            <code>title</code> prop on <code>Card</code>.
          </li>
          <li>
            Giving <code>PrimaryButton</code> a <code>child</code> instead of
            its <code>label</code>. That renders a filled button with no text
            rather than erroring, which is easy to misread as a CSS bug.
          </li>
        </ul>
        <p className="mt-2">
          The catalog does reach the model — correctly-rendered{" "}
          <code>Metric</code> tiles (exact <code>label</code> /{" "}
          <code>value</code> / <code>trend</code> / <code>trendValue</code>{" "}
          props) prove it, and{" "}
          <code>CopilotKitMiddleware.before_agent</code> injects it
          unconditionally. The graph&apos;s system prompt now names both
          failures explicitly, which reduces them but cannot eliminate them:
          this is sampling, so the same prompt can drift again. If you need the
          surface to be deterministic, that is what{" "}
          <a
            href="/generative-ui/a2ui/fixed-schema"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            fixed schema
          </a>{" "}
          is for.
        </p>
      </Callout>

      <Callout tone="warn" title="The leaf primitives are not in the docs">
        <p>
          Both A2UI catalogs import <code>Card</code>, <code>Badge</code>,{" "}
          <code>Button</code>, <code>Separator</code>, <code>CardShell</code>,{" "}
          <code>CHART_COLORS</code> and a colour constant <code>c</code> from a
          sibling <code>_components/</code> directory that no page shows. Those
          are reconstructed in{" "}
          <code>generative-ui/a2ui/_components/primitives.tsx</code> and are the
          only invented UI in either A2UI route. The definitions and renderers
          above are the doc&apos;s. See README §9.
        </p>
      </Callout>

      <Callout tone="info" title="Fixed or dynamic?">
        <p>
          Dynamic when you do not know the shape ahead of time, when the layout
          should vary per turn, or when you are prototyping before committing to
          a schema.{" "}
          <a
            href="/generative-ui/a2ui/fixed-schema"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Fixed
          </a>{" "}
          when the surface is well-known — a flight card, a product tile, an
          order summary — because it is faster, cheaper, has no second LLM call,
          and cannot drift.
        </p>
      </Callout> */}
    </>
  );
}
