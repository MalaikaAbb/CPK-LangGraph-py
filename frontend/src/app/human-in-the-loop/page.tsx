import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A tool that does not return until a human answers.{" "}
          <code>useHumanInTheLoop</code> registers a frontend tool whose{" "}
          <code>render</code> shows a component and whose{" "}
          <code>respond</code> supplies the result. The run genuinely suspends
          in between — that suspension is what makes it human-in-the-loop rather
          than a form the agent happens to draw.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Please book an intro call with the sales team to discuss pricing."]}
            expect="A time picker renders and nothing further streams until you pick. The card then collapses to a green “Booked” badge naming your slot, and the agent confirms it."
            fail="The agent keeps talking past the picker. The tool result was delivered without waiting — respond was called too early, or not at all."
          />
        </div>
      </Panel>

      <Panel title="LangGraph has two HITL patterns, and they differ">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">&nbsp;</th>
                <th className="py-2 pr-4 font-semibold">useHumanInTheLoop</th>
                <th className="py-2 font-semibold">useInterrupt</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ["Who pauses", "The LLM, by choosing to call the tool", "The graph, deterministically"],
                [
                  "Backend surface",
                  "None — a frontend-only tool definition",
                  "A server-side interrupt(...) call in a node",
                ],
                ["Agent aware of it?", "Yes — it is a tool result", "No, by default"],
                ["Needs a checkpointer", "No", "Yes"],
                ["This route", "✓", "→ Interrupts"],
              ].map(([label, a, b]) => (
                <tr
                  key={label}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                    {label}
                  </td>
                  <td className="py-2 pr-4">{a}</td>
                  <td className="py-2">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Pick this one when the pause is a judgement call the model makes and
          you want the picker inlined in the normal tool-call flow. Pick{" "}
          <a
            href="/human-in-the-loop/interrupt-flow"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Interrupts
          </a>{" "}
          when the code path requires a human answer whatever the model thinks.
        </p>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/human-in-the-loop/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The picker">
        <SourceCode file="frontend/src/app/human-in-the-loop/time-picker-card.tsx" />
      </Panel>

      <Panel title="The graph">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Again <code>tools=[]</code>: <code>book_call</code> is defined entirely
          on the frontend and forwarded by <code>CopilotKitMiddleware</code>. The
          only backend-side addition is a prompt telling the model to reach for
          it when asked to schedule something.
        </p>
        <SourceCode file="backend/src/graphs/chat.py" region="factory" />
      </Panel>

      
    </>
  );
}
