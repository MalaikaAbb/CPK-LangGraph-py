import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/threads-lifecycle" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Where a <code>threadId</code> comes from and what moving it does. The
          doc splits the life of a thread into three beats —{" "}
          <strong>mint</strong> (a UUID v4 generated on the client at mount when
          no id is supplied), <strong>run</strong> (messages persist under that
          id if a server-side store exists), and <strong>hydrate</strong>{" "}
          (mounting with a known id replays its history).
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The demo puts a readout of the live id next to the two setters that
          move it, so the beats are visible: watch the id change on{" "}
          <strong>New chat</strong>, and watch <code>explicit</code> flip when
          you open a known conversation.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, press New chat, send another",
              "Pick the first conversation, press Open conversation, then Set id, no replay",
            ]}
            expect="The threadId readout changes on New chat. Open conversation replays the earlier messages and sets explicit to true; Set id, no replay uses the same id but shows the welcome screen."
            fail="Open conversation changes the id but replays nothing — there is no server-side store to replay from, which is expected in SSE mode."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/threads-lifecycle/demo-chat/page.tsx" />
      </Panel>

      <Callout
        tone="warn"
        title="Pick one source of truth — the setters or the prop, never both"
      >
        <p>
          <code>setActiveThreadId</code> and <code>startNewThread</code>{" "}
          <strong>no-op and log a warning</strong> when the{" "}
          <code>threadId</code> is prop-controlled. This demo therefore passes
          no <code>threadId</code> prop at all, which is what makes the buttons
          authoritative.
        </p>
        <p className="mt-2">
          The{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>{" "}
          route is the mirror image: it passes the prop, so the setters are
          unavailable there and &ldquo;New conversation&rdquo; has to remount
          the chat instead. Between them the two routes cover both sides of the
          rule.
        </p>
      </Callout>

      <Callout tone="warn" title="Auto-minted ids do not survive a remount">
        <p>
          The fallback id is computed with <code>useMemo</code>, so a changed
          React <code>key</code>, a parent unmount, or StrictMode&apos;s
          double-mount in development produces a <em>new</em> id and silently
          starts a new conversation. If you need continuity, mint the id
          yourself and pass it as the prop — or restore it through{" "}
          <code>setActiveThreadId</code>. Do not rely on the auto-mint.
        </p>
      </Callout>

      <Callout
        tone="info"
        title="Two kinds of persistence, and they are not the same one"
      >
        <p>
          CopilotKit&apos;s threads store the <em>conversation</em> — the
          messages and tool calls the UI replays. The LangGraph server keeps its
          own graph state under its checkpointer, which is what the Shared State
          routes read. The doc draws this boundary explicitly: clearing one does
          not clear the other, so a thread can outlive the graph state it was
          built from, and a checkpoint can outlive the thread that produced it.
        </p>
      </Callout>
    </>
  );
}
