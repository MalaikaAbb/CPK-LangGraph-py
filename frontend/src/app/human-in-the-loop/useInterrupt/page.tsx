import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/useInterrupt" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Pausing the graph from the backend. The <code>schedule_meeting</code>{" "}
          tool calls LangGraph&apos;s <code>interrupt(&#123; topic, attendee,
          slots &#125;)</code>. The frontend&apos;s <code>useInterrupt</code>{" "}
          renders a time picker in the chat, and <code>resolve(...)</code>{" "}
          resumes the run with <code>&#123; chosen_time, chosen_label &#125;</code>{" "}
          or <code>&#123; cancelled: true &#125;</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Schedule a call with Alice about the Q3 roadmap"]}
            expect="A time-picker card appears inside the chat; after picking, it shows Booked and the agent confirms the time."
            fail="No card and a hanging run: the interrupt payload did not reach useInterrupt (check that the agentId matches gen-ui-interrupt)."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Doc regions verbatim; minimal stand-ins around them">
        <p>
          The page prints the <code>schedule_meeting</code> tool and the{" "}
          <code>useInterrupt</code> render as excerpts, without the graph
          assembly, <code>TimePickerCard</code>,{" "}
          <code>generateFallbackSlots</code> or the suggestions hook. The agent
          (the Python <code>interrupt_agent.py</code>) and, via
          CPK-LangGraph-TS, <code>_shared/interrupt-fallback-slots.ts</code>{" "}
          come from the CopilotKit showcase, with the page&apos;s excerpts as
          their <code>@region</code> blocks, unchanged.{" "}
          <code>TimePickerCard</code> is a minimal stand-in with the showcase
          card&apos;s props; the suggestions hook is not copied (its call is
          commented out). See README §9.
        </p>
      </Callout>

      <Panel title="Agent and demo">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/interrupt_agent.py" },
            { file: "frontend/src/app/human-in-the-loop/_demos/gen-ui-interrupt/page.tsx" },
            { file: "frontend/src/app/human-in-the-loop/_demos/gen-ui-interrupt/_components/time-picker-card.tsx" },
          ]}
        />
      </Panel>
    </>
  );
}
