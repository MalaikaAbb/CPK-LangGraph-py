import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/headless-threads" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The same thread data as the drawer, read through{" "}
          <code>useThreads</code> and rendered by a list this repo owns.
          CopilotKit keeps persistence, replay and pagination; the markup is
          yours.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Two things this has that the prebuilt drawer does not:{" "}
          <strong>rename</strong>, which the drawer&apos;s row menu omits and
          the doc names as the main reason to go headless; and an explicit{" "}
          <code>threadId</code> handoff — the selected id is ordinary React
          state passed to{" "}
          <code>&lt;CopilotChat threadId=&#123;…&#125;&gt;</code>, rather than
          shared through a configuration provider.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press Rename on its row",
              "Press New conversation and send a second message",
            ]}
            expect="The row title changes to “Renamed” without a reload. New conversation clears the chat and the next message opens a second row."
            fail="Rename/Archive/Delete do nothing and the console shows a failed request — in SSE mode /info reports mutations: false, so there is no endpoint behind them."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/headless-threads/demo-chat/page.tsx" />
      </Panel>

      <Callout
        tone="warn"
        title="“New conversation” takes two steps, and the second is not obvious"
      >
        <p>
          <code>useThreads().startNewThread()</code> deselects the list row and
          nothing else — it never touches the chat&apos;s <code>threadId</code>.
          The prebuilt drawer pairs it with a second call on the chat
          configuration, which is unavailable here on two counts: this demo
          mounts no configuration provider, and the chat is prop-controlled,
          which the Lifecycle page says makes those setters no-op.
        </p>
        <p className="mt-2">
          So the second step is ours — and clearing the prop to{" "}
          <code>undefined</code> is not enough. With no prop the chat falls
          through to a fallback id computed with <code>useMemo</code> at mount,
          so clearing returns to the <em>same</em> id and the button looks dead.
          Bumping a React <code>key</code> forces the remount that re-runs that
          memo. The Lifecycle page documents this as a footgun; here it is the
          intended mechanism.
        </p>
      </Callout>

      <Callout tone="info" title="Archive is a soft delete">
        <p>
          <code>archiveThread</code> hides the thread from the default list but
          keeps the row; pass <code>includeArchived: true</code> to{" "}
          <code>useThreads</code> to see it again. <code>deleteThread</code> is
          permanent. Neither has a built-in confirmation — this demo does not
          add one either, which is worth remembering before pressing Delete on a
          thread you wanted.
        </p>
      </Callout>

      <Panel title="Related">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <a
            href="/prebuilt-components/copilot-threads-drawer"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Threads Drawer
          </a>{" "}
          is the zero-wiring version of this list.{" "}
          <a
            href="/threads-lifecycle"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Thread &amp; History Lifecycle
          </a>{" "}
          is the other half of the &ldquo;pick one source of truth&rdquo; rule:
          there the setters are authoritative and no prop is passed.
        </p>
      </Panel>
    </>
  );
}
