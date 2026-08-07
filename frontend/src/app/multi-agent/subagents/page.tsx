import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/multi-agent/subagents" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The canonical multi-agent shape: a supervisor exposes each specialist
          as a tool, decides what to delegate, and reads their results back on
          its next step. Structurally it is just tool-calling — but each
          &ldquo;tool&rdquo; is a full agent with its own prompt and model.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The live delegation log is the part that needs shared state: each tool
          appends to <code>delegations</code> as it finishes, so the user watches
          work fan out instead of staring at one long spinner.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Write a short paragraph explaining why agent-native UIs beat chatbots.",
            ]}
            expect="Three log cards appear in order — 🔍 research, ✍️ writing, 🧐 critique — with the role chips lighting up as each fires, then a final polished answer."
            fail="The log stays empty (state is not reaching the UI), or the critic card stacks repeatedly (the iteration cap is not firing)."
          />
        </div>
      </Panel>

      <Panel title="The sub-agents and their delegation tools">
        <SourceCode file="backend/src/graphs/subagents.py" region="subagents" />
      </Panel>

      <Panel title="The supervisor">
        <SourceCode file="backend/src/graphs/subagents.py" region="supervisor" />
      </Panel>

      <Panel title="The live log">
        <SourceCode file="frontend/src/app/multi-agent/subagents/demo-chat/page.tsx" />
      </Panel>

      
    </>
  );
}
