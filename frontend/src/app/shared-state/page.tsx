import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/shared-state" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          One state object both sides can write. The agent writes{" "}
          <code>notes</code> through a tool; the UI writes{" "}
          <code>preferences</code> through <code>agent.setState</code>. Neither
          goes through the chat thread, and both re-render the other side
          immediately.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The write half is the one worth testing carefully, because it is easy
          to build something that <em>looks</em> like it works. State that the
          model never sees is just a panel. The middleware reading{" "}
          <code>preferences</code> back into the system prompt each turn is what
          makes the channel real.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Hi! I'm a backend engineer in Lisbon evaluating agent frameworks this week.",
              "Then set Tone → playful, Detail → thorough and ask a question",
            ]}
            expect="The scratch pad fills with agent-written notes, and the next reply visibly changes register — longer and looser."
            fail="Notes appear but the tone never changes. The panel is writing state the model is not reading — check the middleware."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/shared-state/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The agent's write side — set_notes">
        <SourceCode
          file="backend/src/graphs/shared_state_read_write.py"
          region="set-notes"
        />
      </Panel>

      <Panel title="The UI's write side — the preferences middleware">
        <SourceCode
          file="backend/src/graphs/shared_state_read_write.py"
          region="preferences-middleware"
        />
      </Panel>

      <Panel title="The graph">
        <SourceCode
          file="backend/src/graphs/shared_state_read_write.py"
          region="agent"
        />
      </Panel>

      <Panel title="The two cards">
        <SourceCode file="frontend/src/app/shared-state/notes-card.tsx" />
        <div className="mt-4">
          <SourceCode file="frontend/src/app/shared-state/preferences-card.tsx" />
        </div>
      </Panel>

      <Callout tone="warn" title="The page names two things it never prints">
        <p>
          Its <code>create_agent</code> literal is published in full — system
          prompt included — and references{" "}
          <code>tools=[set_notes]</code> and{" "}
          <code>middleware=[…, PreferencesInjectorMiddleware()]</code>. Neither
          definition appears on any page. Both are written here to exactly what
          the page describes in prose and in its own prompt: the agent should
          call <code>set_notes</code> &ldquo;with the FULL updated list&rdquo;,
          and preferences &ldquo;will be added as a system message at the start
          of every turn&rdquo;. See README §9.
        </p>
      </Callout>

      <Callout tone="info" title="Pick the narrowest channel that works">
        <p>
          Shared state is the two-way option and it is not always what you want.
          If the value is UI-owned and the agent should only read it, use{" "}
          <a
            href="/shared-state/agent-readonly"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            useAgentContext
          </a>{" "}
          — it has no setter, so a confused model cannot write it back. If a
          long value should appear as it is generated, add{" "}
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            state streaming
          </a>
          . If only some slots should cross the wire at all, that is{" "}
          <a
            href="/shared-state/state-inputs-outputs"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            input/output schemas
          </a>
          .
        </p>
      </Callout>
    </>
  );
}
