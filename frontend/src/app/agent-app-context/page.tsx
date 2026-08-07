import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/agent-app-context" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Telling the agent what is going on in your app in real time — who the
          user is, what page they are on, what they have selected — so they never
          have to retype it into the chat.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Who are my colleagues and what do they each do?",
              "Select a different person, then: draft a short email to the person I have selected.",
            ]}
            expect="The first answers from the directory without being told it. The second addresses whoever is currently selected, and follows your selection when you change it."
            fail="The agent asks who your colleagues are. CopilotKitMiddleware is missing, or state_schema is not CopilotKitState."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/agent-app-context/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph — the prebuilt tab">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Reproduced from the page. This is the whole backend: no lookup, no
          parsing. <code>CopilotKitMiddleware</code> injects every published
          entry into the prompt, and <code>state_schema=CopilotKitState</code> is
          what gives the context somewhere to land.
        </p>
        <SourceCode file="backend/src/graphs/agent_app_context.py" region="agent" />
      </Panel>

      <Panel title="The custom-graph tab — the manual lookup">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          If you build your own nodes instead, the middleware is not doing this
          for you and you pull entries out of state yourself, matching on{" "}
          <code>description</code>. This is the page&apos;s expression lifted
          into a named function — worth reading even on the prebuilt path,
          because it shows exactly what the middleware is saving you.
        </p>
        <SourceCode file="backend/src/graphs/agent_app_context.py" region="lookup" />
      </Panel>

      <Callout tone="info" title="Matching on description is brittle by nature">
        <p>
          The custom-graph lookup keys off the exact string{" "}
          <code>&quot;The current user&apos;s colleagues&quot;</code>. Reword the
          description on the frontend and the backend silently finds nothing —
          there is no id, and no error. Two consequences: keep those strings in
          one shared constant if you go down that path, and prefer the prebuilt
          middleware route where you can, since it reads every entry regardless
          of wording.
        </p>
      </Callout>

      <Callout tone="info" title="The same hook as Agent Read-Only Context">
        <p>
          <code>useAgentContext</code> backs both this page and{" "}
          <a
            href="/shared-state/agent-readonly"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Agent Read-Only Context
          </a>
          . One mechanism, two framings: that page stresses what the channel{" "}
          <em>cannot</em> do (the agent has no setter), this one stresses what
          you would put through it (live app state). Both routes exist because
          both doc pages do.
        </p>
      </Callout>
    </>
  );
}
