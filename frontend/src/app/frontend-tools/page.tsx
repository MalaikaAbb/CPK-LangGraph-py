import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// Verbatim from the page's "Registering a list of tools" section (2026-11).
// Reference only: `useFrontendTools` is not exported by this repo's
// @copilotkit/react-core 1.70.0 (it ships in 1.74.0), and importing a missing
// export fails the bundle. See README §9 item 31.
const USE_FRONTEND_TOOLS = `useFrontendTools(
  reports.map((report) => ({
    name: \`open_\${report.id}\`,
    description: \`Open the \${report.title} report\`,
    handler: async () => navigate(\`/reports/\${report.id}\`),
  })),
  [navigate],
);`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/frontend-tools" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool whose handler runs in the user&apos;s browser rather than on the
          server. That is what lets an agent reach into the app: the handler
          closes over React state, so it can set state, hit browser APIs, read{" "}
          <code>localStorage</code>, or drive a third-party UI library — none of
          which a server-side tool can do.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Make the background a warm sunset gradient.",
              "Now make it something calm and cool-toned.",
            ]}
            expect="The page recolours and the CSS value under the heading updates to whatever the model produced."
            fail="The agent says it changed the background but nothing moves. CopilotKitMiddleware is not forwarding the tool — it must be in the graph's middleware list."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/frontend-tools/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The surface it repaints">
        <SourceCode file="frontend/src/app/frontend-tools/background.tsx" />
      </Panel>

      <Panel title="The graph">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Note <code>tools=[]</code>. <code>change_background</code> exists only
          in the browser; <code>CopilotKitMiddleware</code> is what puts its
          definition on the model&apos;s list each turn. Remove the middleware
          and the tool silently stops existing as far as the agent is concerned.
        </p>
        <SourceCode file="backend/src/graphs/chat.py" region="factory" />
      </Panel>

      <Panel title="Registering a list of tools — reference only">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          New on the page: <code>useFrontendTool</code> registers one tool per
          call, so a list whose length changes between renders needs{" "}
          <code>useFrontendTools</code>, which takes an array and diffs it.
          Shown as text only: the hook first ships in{" "}
          <code>@copilotkit/react-core</code> 1.74.0 and this repo is on 1.70.0,
          so it cannot be imported here.
        </p>
        <CodeBlock code={USE_FRONTEND_TOOLS} language="tsx" />
      </Panel>

      <Callout tone="info" title="The handler's return value is a tool result">
        <p>
          Whatever the handler returns is sent back to the agent as the tool
          result, so the model can tell whether the call worked and reason about
          it next turn. The docs&apos; <code>{'{ status: "success" }'}</code> is
          the minimum useful thing; returning richer data (what changed, what it
          was before) generally produces better follow-up behaviour than
          returning nothing.
        </p>
      </Callout>

      <Callout tone="info" title="One primitive, three doc pages">
        <p>
          Frontend tools also underpin{" "}
          <a
            href="/generative-ui/tool-based"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Components as Tools
          </a>{" "}
          (<code>useComponent</code> — the tool renders instead of running) and{" "}
          <a
            href="/human-in-the-loop"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Human in the Loop
          </a>{" "}
          (<code>useHumanInTheLoop</code> — the tool waits for the user). Same
          channel underneath; the difference is what the handler does with
          control.
        </p>
      </Callout>
    </>
  );
}
