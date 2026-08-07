import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/headless-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A working chat with no CopilotKit components on the page at all. The
          page names three hooks that power it: <code>useAgent</code> for the
          conversation and run state, <code>useCopilotKit</code> for the handle
          you call <code>runAgent</code> on, and{" "}
          <code>useRenderToolCall</code> for painting tool calls inline. This
          route uses the first two — the agent behind it registers no tools, so
          there is nothing for the third to draw.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Explain what a headless UI is, briefly"]}
            expect="Tokens stream into hand-written bubbles. Nothing on screen comes from the package's UI layer."
            fail="Nothing happens and the console shows a runAgent rejection — check the agent server."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/custom-look-and-feel/headless-ui/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="What you give up">
        <p>
          The page is explicit about the trade: going headless gets you text and
          tool calls, and nothing else. Reasoning cards, A2UI and MCP activity
          messages, and custom before/after message slots all stop appearing,
          because <code>&lt;CopilotChatMessageView&gt;</code> was what dispatched
          them. Rebuilding that dispatch by hand — indexing tool results by{" "}
          <code>toolCallId</code>, routing each role to the right leaf — is what
          the page&apos;s &ldquo;complete&rdquo; example is for, and this repo
          exercises that on{" "}
          <a
            href="/programmatic-control"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Programmatic Control
          </a>{" "}
          rather than duplicating it here.
        </p>
      </Callout>
    </>
  );
}
