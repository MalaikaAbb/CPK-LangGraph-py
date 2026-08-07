import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state/agent-readonly" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A one-way UI → agent channel. The page&apos;s framing is the useful
          one: think of these as <em>props for the agent</em>. Each{" "}
          <code>useAgentContext</code> call publishes one value with a
          description, refreshes it when the value changes, and unregisters it
          automatically on unmount.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          What makes it different from{" "}
          <a
            href="/shared-state"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            shared state
          </a>{" "}
          is what is <em>absent</em>: no setter, and no tool the agent could use
          to write back. A confused model has no route to &ldquo;update&rdquo;
          the logged-in user, because none exists.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Who am I and what have I been doing in the app?",
              "Please change my name to Bob and my timezone to UTC.",
            ]}
            expect="The first answers from the panel by name and timezone. The second is politely refused — there is no mechanism for it."
            fail="The agent claims it changed something. It cannot have; nothing is listening."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/agent-readonly/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          One <code>create_agent</code> call and no tools at all — reproduced
          from the page. <code>CopilotKitMiddleware</code> is what threads the
          published entries into the model&apos;s history each turn, so there is
          no lookup code to write.
        </p>
        <SourceCode
          file="backend/src/graphs/readonly_state_agent_context.py"
          region="agent"
        />
      </Panel>

      <Callout tone="info" title="The description is the API">
        <p>
          It is the only label the agent sees next to the value, so vague
          descriptions produce vague behaviour. Compare &ldquo;the user&rdquo;
          with &ldquo;The user&apos;s IANA timezone (used when mentioning
          times)&rdquo; — the second tells the model both what the value is and
          when to apply it. Treat it like a parameter docstring.
        </p>
      </Callout>

      <Callout tone="info" title="Where the boundary is">
        <p>
          Reach for <code>useAgentContext</code> when the value is an{" "}
          <em>input</em>: current user, selected record, feature flags, scroll
          position, page. Reach for shared state when it is a{" "}
          <em>workspace</em> both parties edit: notes, a document, a plan.
          Getting this wrong in the permissive direction — using shared state
          for something UI-owned — is what lets a model overwrite the
          user&apos;s identity mid-conversation.
        </p>
      </Callout>
    </>
  );
}
