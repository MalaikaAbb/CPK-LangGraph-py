import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

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
