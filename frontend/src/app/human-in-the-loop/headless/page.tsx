import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/headless" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same <code>schedule_meeting</code> interrupt, resolved outside the
          chat. A hand-written <code>useHeadlessInterrupt</code> subscribes to
          the agent through <code>useAgent</code>, holds the pending payload,
          and renders the picker in the app surface (left pane) instead of a
          chat bubble. Resolving it resumes the run with{" "}
          <code>copilotkit.runAgent(&#123; forwardedProps: &#123; command:
          &#123; resume &#125; &#125; &#125;)</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Schedule a call with Alice about the Q3 roadmap"]}
            expect="The picker pops up in the left pane, not in the chat; picking a slot lets the agent confirm in the chat."
            fail="The run hangs with nothing on the left: the interrupt event was not captured by the headless hook."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Page file verbatim; one stand-in">
        <p>
          The page prints this demo&apos;s main file and two smaller panels.
          The main file is the page&apos;s, verbatim; the{" "}
          <code>AppSurface</code> it renders but never defines is a minimal
          slot picker written here (the showcase&apos;s styled popup is not
          copied), and <code>_shared/interrupt-fallback-slots.ts</code> comes
          from the CopilotKit showcase (via CPK-LangGraph-TS). The page
          publishes no backend; the agent is this repo&apos;s existing{" "}
          <code>interrupt-headless</code> graph (written for Programmatic
          Control), which interrupts with the same{" "}
          <code>{"{ topic, attendee, slots }"}</code> payload.
        </p>
      </Callout>

      <Panel title="Demo">
        <SourceCode file="frontend/src/app/human-in-the-loop/_demos/interrupt-headless/page.tsx" />
      </Panel>
    </>
  );
}
