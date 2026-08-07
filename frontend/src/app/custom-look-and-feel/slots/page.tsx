import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const LEVELS = `// 1. Tailwind classes — merged with the default component's own
<CopilotChat messageView="bg-gray-50 p-4" input="border-2 rounded-xl" />

// 2. Props override — merged into the default component's props
<CopilotChat messageView={{ className: "my-messages" }} input={{ autoFocus: true }} />

// 3. Custom component — replaces the default entirely
<CopilotChat messageView={CustomMessageView} />

// …and they nest, to any depth
<CopilotChat messageView={{ assistantMessage: { copyButton: MyCopyButton } }} />`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/custom-look-and-feel/slots" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Every chat component is assembled from named sub-components, and each
          one is a prop. Pass a string and it merges Tailwind classes; pass an
          object and it merges props; pass a component and it replaces the slot
          outright. The same three rules apply at every depth, which is what the
          page means by calling slots recursive.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What are slots for?"]}
            expect="A gradient panel before you send anything; afterwards every reply sits in a tinted card tagged “slot”, and a violet custom disclaimer sits under the composer."
            fail="The stock chat. A slot prop is being passed a component of the wrong shape, so the default fell through."
          />
        </div>
      </Panel>

      <Panel title="The three override levels">
        <CodeBlock code={LEVELS} language="tsx" />
      </Panel>

      <Panel title="The slot components">
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/slot-overrides.tsx" />
      </Panel>

      <Panel title="Wiring them up">
        <SourceCode file="frontend/src/app/custom-look-and-feel/slots/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Available slots">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">Slot</th>
                <th className="py-2 font-semibold">What it is</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ["messageView", "The message list container."],
                ["scrollView", "The scroll container with auto-scroll behavior."],
                ["input", "The text input area with send/transcribe controls."],
                ["suggestionView", "The suggestion pills shown below messages."],
                [
                  "welcomeScreen",
                  "The initial empty-state screen (pass false to disable).",
                ],
                ["header", "Sidebar and Popup only — the modal header bar."],
                [
                  "toggleButton",
                  "Sidebar and Popup only — the open/close toggle.",
                ],
              ].map(([slot, desc]) => (
                <tr
                  key={slot}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="py-2 pr-4 font-mono text-xs text-slate-900 dark:text-slate-100">
                    {slot}
                  </td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          <code>labels</code> is <em>not</em> part of this system — it is a
          separate convenience prop for user-facing copy, exercised on the{" "}
          <a
            href="/custom-look-and-feel/css"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            CSS
          </a>{" "}
          and{" "}
          <a
            href="/prebuilt-components/popup"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Popup
          </a>{" "}
          routes.
        </p>
      </Panel>

    </>
  );
}
