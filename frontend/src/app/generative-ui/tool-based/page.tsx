import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/tool-based" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The simplest form of generative UI: register a React component with{" "}
          <code>useComponent</code> and CopilotKit exposes it to the agent as a
          tool. When the agent calls it, the arguments become the
          component&apos;s props and it renders inline.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The distinction from{" "}
          <a
            href="/generative-ui/tool-rendering"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Tool Rendering
          </a>{" "}
          is worth being precise about, because they look similar in the chat.
          There, a real backend tool runs and you customise how the call is{" "}
          <em>displayed</em>. Here there is no backend tool at all — the
          component <em>is</em> the tool. No handler, no execution, no result.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Chart the number of days in each month of 2026."]}
            expect="A bar chart renders inline with twelve bars, and the reply does not repeat the numbers in prose."
            fail="The agent lists the numbers as text. It did not pick the tool — the name should read like a verb (render_bar_chart) so the model reaches for it."
          />
        </div>
      </Panel>

      <Panel title="The registration">
        <SourceCode file="frontend/src/app/generative-ui/tool-based/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The component">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Ordinary React that has never heard of CopilotKit. Its Zod schema
          doubles as the tool&apos;s parameter definition, which is what makes
          the props type-safe on both sides of the call.
        </p>
        <SourceCode file="frontend/src/app/generative-ui/tool-based/bar-chart.tsx" />
      </Panel>

      <Panel title="The graph behind it">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          The page&apos;s backend section is the bare{" "}
          <code>create_agent</code> with <code>tools=[]</code> —{" "}
          <code>render_bar_chart</code> never appears server-side, because{" "}
          <code>CopilotKitMiddleware</code> forwards it in from the browser on
          every turn. The only addition here is a prompt nudging the model to
          draw rather than describe.
        </p>
        <SourceCode file="backend/src/graphs/chat.py" region="factory" />
      </Panel>

      <Callout tone="info" title="Name it like a verb">
        <p>
          The <code>name</code> passed to <code>useComponent</code> is what the
          agent sees as the tool name, and it is the main lever on whether the
          model picks it. <code>render_bar_chart</code> and{" "}
          <code>show_weather</code> get chosen reliably; a noun like{" "}
          <code>bar_chart</code> often does not.
        </p>
      </Callout>
    </>
  );
}
