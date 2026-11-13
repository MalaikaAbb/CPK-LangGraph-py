import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/index" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The HITL overview&apos;s demo: <code>useHumanInTheLoop</code>{" "}
          registers a <code>book_call</code>-style frontend tool whose render is
          a time-picker card. The run suspends on the card until the user picks
          a slot or cancels, and the answer goes back to the agent as the tool
          result. The page also points to the other two patterns,{" "}
          <code>useInterrupt</code> (graph-side <code>interrupt()</code>) and
          headless interrupts, which have their own routes.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Book a call with sales to discuss pricing"]}
            expect="A time-picker card appears in the chat; picking a slot makes the agent confirm that time."
            fail="The agent proposes a time in text without a card: the frontend tool never reached the graph's bound tools."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Code tab verbatim">
        <p>
          Agent, demo page and time-picker card are the page&apos;s Code tab.
          The demo mounts its own <code>&lt;CopilotKit&gt;</code> against this
          repo&apos;s main runtime, where <code>hitl-in-chat</code> now maps to
          the doc&apos;s agent. <code>/human-in-the-loop</code> shares it. The
          Code tab&apos;s 190-line showcase <code>route.ts</code> is replaced
          by the existing runtime route. The agent is the Code tab&apos;s
          Python file, with the model redirected to <code>_shared.MODEL</code>.
          Route page layout from the CPK-LangGraph-TS harness.
        </p>
      </Callout>

      <Panel title="Agent and demo">
        <SourceCodeGroup
          files={[
            { file: "backend/src/agents/hitl_in_chat_agent.py" },
            { file: "frontend/src/app/human-in-the-loop/index/demo-chat/page.tsx" },
            { file: "frontend/src/app/human-in-the-loop/index/demo-chat/time-picker-card.tsx" },
          ]}
        />
      </Panel>
    </>
  );
}
