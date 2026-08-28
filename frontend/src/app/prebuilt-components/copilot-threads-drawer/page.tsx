import { RouteHeader } from "@/components/route-header";
import { SourceCode, SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/prebuilt-components/copilot-threads-drawer" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A conversation sidebar with <em>no active-thread state of your own</em>.
          The drawer and the chat sit inside one{" "}
          <code>CopilotChatConfigurationProvider</code>, and that shared
          configuration holds the active thread — so selecting a row connects
          the chat to that thread and replays its history, and
          &ldquo;New Conversation&rdquo; resets it to a welcome screen. No{" "}
          <code>threadId</code> state, no selection handler, no props between
          the two components.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Under the hood it wraps a self-contained{" "}
          <code>copilotkit-threads-drawer</code> web component fed by{" "}
          <code>useThreads</code> — the same data the{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>{" "}
          route reads directly.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Send a message, then press New Conversation and send another",
              "Click back to the first row",
            ]}
            expect="Two rows in the drawer. Clicking the first replays its messages into the chat without a page reload. The row menu offers archive and delete."
            fail="A locked panel offering an upgrade instead of a list — that is the license gate, not a wiring bug. See the two switches below."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/prebuilt-components/copilot-threads-drawer/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="warn" title="Two independent switches, and they fail differently">
        <p>
          Threads need <strong>Intelligence mode</strong> — the runtime built
          with <code>INTELLIGENCE_API_KEY</code>. Without it the runtime falls
          back to SSE with an in-memory runner: the list answers locally,
          nothing survives a restart, and mutations are off.
        </p>
        <p className="mt-2">
          The drawer&apos;s <em>UI</em> needs a <strong>license</strong> —
          either <code>publicLicenseKey</code> on the provider (what the
          doc&apos;s own sample passes) or <code>licenseToken</code> on the
          runtime. The drawer gates on the reported license status, <em>not</em>{" "}
          on whether thread endpoints respond. So a runtime can serve threads
          perfectly while every drawer shows an Upgrade button.
        </p>
        <p className="mt-2">
          Set both. The{" "}
          <a
            href="/quickstart"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Quickstart
          </a>{" "}
          route reports which of them this checkout actually has.
        </p>
      </Callout>

      <Panel
        title="What makes it work"
        description="The runtime that serves threads, and the provider that identifies whose they are."
      >
        <SourceCodeGroup
          files={[
            { file: "frontend/src/lib/copilot-runtime.ts" },
            { file: "frontend/src/components/providers.tsx" },
          ]}
          note={
            <>
              Threads are per-user: <code>identifyUser</code> on the runtime
              reads the <code>x-user-id</code> header the provider sends.
              Without that pairing every visitor of a deployed copy shares one
              history.
            </>
          }
        />
      </Panel>

      <Callout tone="info" title="Rename is missing on purpose">
        <p>
          The drawer&apos;s row menu covers archive, unarchive and delete — but
          not rename. The doc names that as the main reason to drop to{" "}
          <code>useThreads</code>, which is exactly what the{" "}
          <a
            href="/headless-threads"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            Headless Threads
          </a>{" "}
          route does.
        </p>
      </Callout>
    </>
  );
}
