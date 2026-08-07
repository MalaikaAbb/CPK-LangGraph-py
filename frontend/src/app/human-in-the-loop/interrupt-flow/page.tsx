import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const DOC_ENABLED = `// As published on the doc page, and as reproduced on this route:
useInterrupt({
  agentId: "starterAgent",
  enabled: ({ eventValue }) => eventValue.type === 'ask',
});

// What the installed package declares:
//   enabled?: (event: InterruptEvent<TValue>) => boolean
//   interface InterruptEvent<TValue> { name: string; value: TValue }
//
// There is no \`eventValue\` field, so tsc reports:
//   error TS2339: Property 'eventValue' does not exist
//                 on type 'InterruptEvent<any>'.`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/interrupt-flow" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          LangGraph&apos;s native <code>interrupt()</code>, which is the one
          capability in this suite with no counterpart in the other
          integrations. A node calls <code>interrupt(payload)</code>, the run
          suspends <em>inside</em> that node, the payload reaches the client, and
          resuming replays the node with the user&apos;s answer substituted for
          the <code>interrupt()</code> return value.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The difference from{" "}
          <a
            href="/human-in-the-loop"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            useHumanInTheLoop
          </a>{" "}
          is who decides. There the model chooses to ask. Here the graph stops
          whether the model wanted to or not, which is what you want for a
          deterministic approval gate.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Hello! Who are you?"]}
            expect="On the Single interrupt tab: the run halts and a form appears. Answer it, resume, answer the second, and the agent introduces itself by the name you gave."
            fail="On the Multiple interrupts tab nothing appears at all — that is the doc bug this route exists to show, not a setup problem. See the callout below."
          />
        </div>
      </Panel>

      <Panel title="Two tabs, because the page has two examples">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">Tab</th>
                <th className="py-2 pr-4 font-semibold">Doc section</th>
                <th className="py-2 font-semibold">Outcome</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              <tr className="border-b border-slate-100 dark:border-slate-900">
                <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                  Single interrupt
                </td>
                <td className="py-2 pr-4">
                  Main walkthrough — one hook, no <code>enabled</code>
                </td>
                <td className="py-2">✅ Works</td>
              </tr>
              <tr className="border-b border-slate-100 dark:border-slate-900">
                <td className="py-2 pr-4 font-medium text-slate-900 dark:text-slate-100">
                  Multiple interrupts
                </td>
                <td className="py-2 pr-4">&ldquo;Condition UI executions&rdquo;</td>
                <td className="py-2">❌ Never fires — see below</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Each tab is its own component and is keyed, so switching genuinely
          unmounts one set of hooks and mounts the other —{" "}
          <code>useInterrupt</code> cannot be called conditionally. Interrupts
          also fire once per thread, so use <strong>Reset thread</strong> before
          switching or the second tab has nothing left to interrupt on.
        </p>
      </Panel>

      <Panel title="The graph">
        <SourceCode file="backend/src/graphs/interrupt_flow.py" region="agent" />
      </Panel>

      <Panel title="The two handlers">
        <SourceCode file="frontend/src/app/human-in-the-loop/interrupt-flow/demo-chat/page.tsx" />
      </Panel>

      <Callout
        tone="warn"
        title="The page's `enabled` predicate does not match the installed type"
      >
        <p className="mb-3">
          This route reproduces the conditional-interrupts section exactly as
          published, mismatch included — the two <code>enabled</code> predicates
          in the demo above are the page&apos;s, uncorrected. Each carries a{" "}
          <code>@ts-expect-error</code> so the rest of the app still builds; the
          expressions themselves are untouched.
        </p>
        <CodeBlock code={DOC_ENABLED} language="tsx" />
        <p className="mt-3">
          Consequence at runtime: destructuring <code>eventValue</code> off an
          object that has <code>name</code> and <code>value</code> yields{" "}
          <code>undefined</code>, so the predicate throws on{" "}
          <code>undefined.type</code> the moment an interrupt fires and neither
          card renders. That is what the doc&apos;s code does as written.
        </p>
      </Callout>

      <Callout tone="warn" title="Two properties of interrupt() worth knowing before you use it">
        <ul className="mt-1 list-disc space-y-1.5 pl-5">
          <li>
            <strong>It requires a checkpointer.</strong> Suspending means
            persisting the pending state and re-entering later. With no
            checkpointer there is nothing to resume into. Under the FastAPI
            transport that is the <code>MemorySaver</code> compiled into the
            graph; under LangSmith the platform provides it.
          </li>
          <li>
            <strong>The node re-runs from the top.</strong> Everything above the{" "}
            <code>interrupt()</code> call executes <em>again</em> on resume, so a
            node that interrupts must not do anything non-idempotent
            beforehand — no charging a card, no sending an email, no appending
            to a list — or it happens twice.
          </li>
        </ul>
      </Callout>

      <Callout tone="info" title="The agent does not know it was interrupted">
        <p>
          The page is explicit that this is the trade-off:{" "}
          <code>interrupt()</code> pauses the graph, not the conversation, so
          the model has no tool result telling it what happened. That is why the
          answer here is written into state and surfaced through the system
          prompt — the node has to hand it to the model deliberately. If you want
          the agent aware of the exchange as part of its reasoning,{" "}
          <a
            href="/human-in-the-loop"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            useHumanInTheLoop
          </a>{" "}
          gives you that for free.
        </p>
      </Callout>

      <Callout tone="info" title="Driving it without a chat">
        <p>
          <code>useInterrupt</code> renders inside{" "}
          <code>&lt;CopilotChat&gt;</code> by default. To resolve an interrupt
          from a button, a modal or anywhere else, subscribe to{" "}
          <code>on_interrupt</code> yourself and resume with{" "}
          <code>
            copilotkit.runAgent({"{ agent, forwardedProps: { command: { resume } } }"})
          </code>
          . That is built on{" "}
          <a
            href="/programmatic-control"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Programmatic Control
          </a>
          .
        </p>
      </Callout>
    </>
  );
}
