import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>&lt;CopilotChat&gt;</code> is the primitive the other two
          prebuilt surfaces wrap. It has no chrome of its own — no launcher, no
          docking — so it fills whatever box you put it in. That is why it is the
          right choice for a dedicated chat page or an inline pane, and why the
          Sidebar and Popup routes are this same component with a shell around
          it.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What can you help me with?", "Tell me a short joke"]}
            expect="Suggestion pills render before the first message; clicking one sends it and the reply streams."
            fail="An empty box with no input — the chat has no height. Its container needs one."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The graph behind it">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          The docs print one backend snippet across every frontend-focused page
          — the bare <code>create_agent</code> with <code>tools=[]</code>. It is
          a factory here so the dozen routes that need it each get their own
          conversation.
        </p>
        <SourceCode file="backend/src/graphs/chat.py" region="factory" />
      </Panel>

      <Panel title="The props this page documents">
        <dl className="space-y-2 text-sm">
          {[
            [
              "agentId",
              "Which agent the chat talks to. Must match a runtime-registered id.",
            ],
            [
              "labels",
              "User-facing copy: header title, placeholder, welcome, disclaimer.",
            ],
            ["messageView", "Slot for the message list."],
            ["input", "Slot for the composer."],
            ["scrollView", "Slot for the scroll container."],
            ["suggestionView", "Slot for the suggestion pills."],
            ["welcomeScreen", "Slot for the empty state. Pass false to disable."],
          ].map(([name, desc]) => (
            <div
              key={name}
              className="flex flex-col gap-0.5 sm:flex-row sm:gap-3"
            >
              <dt className="shrink-0 font-mono text-xs text-slate-900 sm:w-36 dark:text-slate-100">
                {name}
              </dt>
              <dd className="text-slate-600 dark:text-slate-400">{desc}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Every slot is exercised on the{" "}
          <a
            href="/custom-look-and-feel/slots"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Slots
          </a>{" "}
          route rather than duplicated here.
        </p>
      </Panel>

      <Callout tone="warn" title="The doc's snippet calls an undefined helper">
        <p>
          Its code sample is{" "}
          <code>
            {
              'function Chat() { useAgenticChatSuggestions(); return <CopilotChat agentId="agentic_chat" />; }'
            }
          </code>
          . <code>useAgenticChatSuggestions</code> is local to CopilotKit&apos;s
          own demo app and is not exported by any package. It wraps{" "}
          <code>useConfigureSuggestions</code>, which is exported, so this route
          calls that directly.
        </p>
      </Callout>
    </>
  );
}
