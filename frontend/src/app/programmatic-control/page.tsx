import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const SEND_PIPELINE = `// The page's headless-complete send pipeline. The three helpers it opens by
// destructuring — useAttachmentsConfig, useAutoScroll, buildContent — are
// never defined anywhere in the docs.
const { attachments, consumeAttachments, /* … */ } = useAttachmentsConfig();
const { listRef, bottomRef, stickRef } = useAutoScroll(messages, agent.isRunning);

const content = buildContent(trimmed, ready);
agent.addMessage({ id: crypto.randomUUID(), role: "user", content });
void copilotkit.runAgent({ agent });`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/programmatic-control" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Driving an agent from code rather than a composer. Three primitives
          cover every triggering pattern:
        </p>
        <dl className="mt-3 space-y-2 text-sm">
          {[
            [
              "agent.addMessage(…)",
              "Appends a message without running the agent. Pair with runAgent when the message should start a turn.",
            ],
            [
              "copilotkit.runAgent({ agent })",
              "The same entry point <CopilotChat> calls internally. Orchestrates frontend tools, follow-up runs and the subscriber lifecycle.",
            ],
            [
              "agent.subscribe(subscriber)",
              "Low-level AG-UI event subscription — onCustomEvent, onRunStartedEvent, onRunFinalized, onRunFailed.",
            ],
          ].map(([n, d]) => (
            <div key={n} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-56 dark:text-slate-100">
                {n}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{d}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4">
          <TryIt
            prompts={["Open the demo"]}
            expect="An empty frame. That is the correct outcome — see the callout below."
            fail="Anything rendering at all would mean the snippet had been completed rather than reproduced."
          />
        </div>
      </Panel>


   
       <Panel title="It is an issue - half the code is missing and imports are missing">
        <Callout tone="warn" title="Missing code">
          <p>
           Missing imports and code 
          </p>
        </Callout>
      </Panel>

      <Panel title="The demo — the doc's send pipeline, verbatim">
        <SourceCode file="frontend/src/app/programmatic-control/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The three helpers it never defines">
        <SourceCode file="frontend/src/app/programmatic-control/headless-helpers.ts" />
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/chat.py" region="factory" />
      </Panel>

      <Panel title="copilotkit.runAgent() vs agent.runAgent()">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Both trigger the agent, at different levels, and picking the wrong one
          produces symptoms that look like unrelated bugs:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            <code>copilotkit.runAgent({"{ agent }"})</code> — the recommended
            default. Runs the full lifecycle: executes frontend tools, chains
            follow-up runs, routes errors through subscribers.
          </li>
          <li>
            <code>agent.runAgent(options)</code> — sends the request but does{" "}
            <strong>not</strong> execute frontend tools or chain follow-ups. If
            your frontend tools mysteriously never fire, this is usually why.
          </li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Interrupt resume goes through the <code>copilotkit</code> one so the
          subscriber lifecycle still wraps the resumed run.
        </p>
      </Panel>

      <Callout tone="warn" title="The page's send pipeline destructures three helpers it never defines">
        <p className="mb-3">
          Its <code>headless-complete</code> snippet opens with these:
        </p>
        <CodeBlock code={SEND_PIPELINE} language="tsx" />
        <p className="mt-3">
          Only <code>useAttachmentsConfig</code> has a real counterpart — it is{" "}
          <code>useAttachments</code>, which <em>is</em> exported and already
          returns every field the snippet destructures,{" "}
          <code>consumeAttachments</code> included.{" "}
          <code>useAutoScroll</code> and <code>buildContent</code> appear nowhere
          in the docs or in any package. Both are reconstructed in{" "}
          <code>headless-helpers.ts</code> from how the snippet uses them, which
          is the second reason this route is Partial: the primitives it
          demonstrates are the doc&apos;s, but the scaffolding around them is
          this repo&apos;s guess at code that was never published.
        </p>
      </Callout>

      <Callout
        tone="info"
        title="Resolving an interrupt headlessly is a separate example"
      >
        <p>
          The page also shows a hand-rolled hook that subscribes to{" "}
          <code>on_interrupt</code> custom events and resumes with{" "}
          <code>
            copilotkit.runAgent({"{ agent, forwardedProps: { command: { resume } } }"})
          </code>
          . That half <em>is</em> printed in full and does work — it is the
          mechanism behind{" "}
          <a
            href="/human-in-the-loop/interrupt-flow"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Interrupts
          </a>
          , driven from a button instead of <code>useInterrupt</code>. The{" "}
          <code>interrupt-headless</code> graph remains registered in{" "}
          <code>registry.py</code> for it.
        </p>
      </Callout>
    </>
  );
}
