import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

// Verbatim from the page's "Control the open state from your own UI" section
// (2026-11). Reference only: `open` / `onOpenChange` on CopilotSidebar and
// CopilotPopup ship in @copilotkit/react-core 1.71.0; this repo is on 1.70.0.
// See README §9 item 31.
const CONTROLLED = `import { useState } from "react";
import { CopilotSidebar } from "@copilotkit/react-core/v2";

function Layout() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <nav>
        <button onClick={() => setChatOpen(true)}>Ask the assistant</button>
      </nav>

      <CopilotSidebar open={chatOpen} onOpenChange={setChatOpen} />
    </>
  );
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/chat-controls" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two controls that sit outside the chat component itself. Modal state
          lives in the chat configuration context, so{" "}
          <code>useCopilotChatConfiguration()</code> lets any component in the
          subtree open or close the prebuilt surfaces. Feedback works the other
          way round: the thumbs buttons do not exist until you pass a handler,
          so supplying <code>onThumbsUp</code> is what makes them render.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Press “Ask the assistant”, send a message, rate the reply"]}
            expect="Both buttons open the closed sidebar, the toggle's label flips between Open and Close chat, and rating appends a row carrying that message's id."
            fail="The buttons do not render at all — nothing above them owns modal state. See the note below; this is the single most common way to get this wrong."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/chat-controls/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Controlled open state — reference only">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          New on the page and now its first pattern: own the open state with{" "}
          <code>open</code> + <code>onOpenChange</code>, so a button outside
          the chat subtree can open it with no extra provider. Shown as text:
          those props first ship in <code>@copilotkit/react-core</code> 1.71.0
          and this repo is on 1.70.0, so the demo above still uses the
          configuration-context pattern, which the page keeps as the
          alternative.
        </p>
        <CodeBlock code={CONTROLLED} language="tsx" />
      </Panel>

      <Callout tone="info" title="Thumbs without handlers needs Intelligence">
        <p>
          The page now says the thumbs buttons also appear with no handler when
          Automatic Learning capture is on and a Trajectory has started. That is
          an Intelligence Platform feature — requires premium, not testable
          locally — so this demo still opts in with handlers.
        </p>
      </Callout>

      <Callout
        tone="warn"
        title="Sibling buttons need an explicit provider — this demo got it wrong first"
      >
        <p>
          <code>useCopilotChatConfiguration()</code> returns <strong>null</strong>{" "}
          unless a <code>CopilotChatConfigurationProvider</code> sits above the
          caller. <code>&lt;CopilotSidebar&gt;</code> does create one — but{" "}
          <em>inside itself</em>, wrapping only its own subtree. Buttons rendered
          as its siblings are outside that provider, so the usual guard{" "}
          <code>if (!config?.setModalOpen) return null</code> makes them
          disappear with no error anywhere.
        </p>
        <p className="mt-2">
          The knock-on effect is what makes it confusing to diagnose: with{" "}
          <code>defaultOpen={"{false}"}</code> and no working buttons, the
          sidebar can never be opened, so no assistant message is ever produced
          and the thumbs buttons appear to be broken too. Two symptoms, one
          cause.
        </p>
        <p className="mt-2">
          The fix is the provider the doc page prescribes for composing chat
          yourself — wrapping <strong>both</strong> the buttons and the sidebar:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            &lt;CopilotChatConfigurationProvider agentId=&quot;…&quot;
            isModalDefaultOpen={"{false}"}&gt;
          </code>
        </p>
        <p className="mt-2">
          Nesting is safe and expected. The inner provider calls the outer&apos;s{" "}
          <code>setModalOpen</code> on every change and mirrors the outer&apos;s{" "}
          <code>isModalOpen</code> back down through an effect, so the two stay
          in sync whichever side toggles.
        </p>
      </Callout>
    </>
  );
}
