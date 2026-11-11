import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/open-generative-ui" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Open-ended UI: with <code>openGenerativeUI</code> enabled on the
          runtime, the agent gets a <code>generateSandboxedUi</code> tool and
          streams its own HTML/CSS/JS into a sandboxed iframe. The minimal demo
          swaps the design skill for a visualisation-tuned one. The{" "}
          <Link
            href="/generative-ui/open-generative-ui/advanced"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            advanced demo
          </Link>{" "}
          adds sandbox functions that the iframe can call back into the host
          page.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Visualize how a neural network forward pass works, animated"]}
            expect="A self-running visualisation streams into an iframe in the chat."
            fail="Plain text or a code block instead of an iframe: openGenerativeUI is not enabled for this agent on the runtime."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Code tab verbatim; three files borrowed">
        <p>
          Both agents, the runtime route and both demo pages are the
          page&apos;s Code tab. The minimal demo imports <code>./chat</code>{" "}
          and <code>./design-skill</code>, which the tab does not show. They
          come from the CopilotKit showcase (via the CPK-LangGraph-TS
          harness): <code>chat.tsx</code> as a bare{" "}
          <code>&lt;CopilotChat&gt;</code>, and <code>design-skill.ts</code>,
          whose prompt feeds the <code>openGenerativeUI.designSkill</code> prop
          the page teaches. The showcase suggestion chips (both demos&apos;{" "}
          <code>suggestions.ts</code>) were not copied; the advanced
          page&apos;s <code>useConfigureSuggestions</code> call is kept as{" "}
          <code>// doc:</code> comments. The agents are the
          Code tab&apos;s Python files and the runtime route builds them with{" "}
          <code>buildAgents</code>. See README
          §9.
        </p>
      </Callout>

      <Panel title="Runtime and agents">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-ogui/route.ts" },
            { file: "backend/src/agents/open_gen_ui_agent.py" },
            { file: "backend/src/agents/open_gen_ui_advanced_agent.py" },
          ]}
        />
      </Panel>

      <Panel title="Demos">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/generative-ui/open-generative-ui/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/open-generative-ui/advanced/page.tsx" },
            { file: "frontend/src/app/generative-ui/open-generative-ui/advanced/sandbox-functions.ts" },
          ]}
        />
      </Panel>
    </>
  );
}
