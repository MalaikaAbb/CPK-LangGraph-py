import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const CATCHALL = `// Zero-config: registers the package's built-in card as the "*" renderer.
useDefaultRenderTool();

// Branded: the same wildcard, drawn your way. A convenience wrapper around
// useRenderTool({ name: "*", ... }).
useDefaultRenderTool({
  render: ({ name, parameters, status, result }) => (
    <MyCard name={name} parameters={parameters} status={status} result={result} />
  ),
}, []);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Deciding how each tool call looks in the chat instead of showing raw
          JSON. A renderer receives three things — the parsed arguments, a live{" "}
          <code>status</code>, and the <code>result</code> once it arrives —
          which is what lets one component draw both the in-flight and the
          finished state.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What's the weather in Tokyo?", "Find flights to JFK and roll a d20."]}
            expect="A card shows “Calling weather API…” with Tokyo already visible, then fills in with 68°, Sunny — and the reply does not restate the numbers. The second prompt shows two default status cards (search_flights, roll_d20) from the wildcard."
            fail="Raw JSON, or nothing at all (for the second prompt: no default cards for search_flights / roll_d20). The renderer's name does not match the tool name exactly, or no wildcard is registered."
          />
        </div>
      </Panel>

      <Panel title="The renderers">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The card">
        <SourceCode file="frontend/src/app/generative-ui/tool-rendering/weather-card.tsx" />
      </Panel>

      <Panel title="The backend tools">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          From the page&apos;s demo Code tab, which carries all four tools; the
          prose section still prints only <code>get_weather</code>.
        </p>
        <SourceCode file="backend/src/graphs/tool_rendering.py" region="tool" />
      </Panel>

      <Panel title="The agent and its failure middleware">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          New in the Code tab: <code>stop_after_tool_failure</code> runs
          before each model call and ends the turn with a fixed message when
          the latest tool result has <code>status=&quot;error&quot;</code>.
        </p>
        <SourceCode file="backend/src/graphs/tool_rendering.py" region="agent" />
      </Panel>

      <Panel title="The two levels of catch-all">
        <CodeBlock code={CATCHALL} language="tsx" />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Named renderers claim the interesting tools and the wildcard handles
          everything else. The important thing is that{" "}
          <strong>the wildcard is not optional</strong> if you want to see
          unmatched calls at all — without a <code>*</code> renderer the runtime
          has nothing to draw them with and they are silently invisible, which
          reads as &ldquo;the agent never called a tool&rdquo;.
        </p>
      </Panel>

      <Callout tone="info" title="Grouping needs a newer CopilotKit">
        <p>
          The page now groups consecutive default-rendered calls into one card
          (&ldquo;Used 3 tools&rdquo;) and lets you pick the display with{" "}
          <code>messageView.toolCallDisplay</code>. That shipped after{" "}
          <code>@copilotkit/react-core</code> 1.79; this repo is on 1.70.0, so
          calls here still render one card each and the option is not wired.
        </p>
      </Callout>
    </>
  );
}
