import { INTELLIGENCE_ENABLED } from "@/lib/copilot-runtime";

import { KeyValue } from "./ui";

/**
 * What the runtime in this checkout is actually configured with.
 *
 * A server component on purpose: `INTELLIGENCE_API_KEY` and
 * `COPILOTKIT_LICENSE_TOKEN` are server-side, so reading them here keeps them
 * out of the browser bundle while still letting the Quickstart page say
 * something true about the running app rather than describing the doc.
 *
 * The credentials are reported separately because they fail separately — see
 * the callout beneath this panel on that page.
 */
const HAS_LICENSE_TOKEN = Boolean(process.env.COPILOTKIT_LICENSE_TOKEN);

/**
 * The client-side half of the same axis, and what the Threads Drawer doc's own
 * sample passes. Either satisfies the drawer's license check, so both are
 * reported — showing only the server token would call a correctly licensed app
 * unlicensed.
 */
const HAS_PUBLIC_LICENSE_KEY = Boolean(
  process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY,
);
const HAS_LICENSE = HAS_LICENSE_TOKEN || HAS_PUBLIC_LICENSE_KEY;

function Pill({
  on,
  onText,
  offText,
}: {
  on: boolean;
  onText: string;
  offText: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
        on
          ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
          : "border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${on ? "bg-emerald-500" : "bg-slate-400"}`}
        aria-hidden
      />
      {on ? onText : offText}
    </span>
  );
}

export function IntelligenceStatus() {
  return (
    <>
      <KeyValue
        rows={[
          [
            "Runtime mode",
            <Pill
              key="mode"
              on={INTELLIGENCE_ENABLED}
              onText="Intelligence"
              offText="SSE + in-memory runner"
            />,
          ],
          [
            "INTELLIGENCE_API_KEY",
            <Pill
              key="key"
              on={INTELLIGENCE_ENABLED}
              onText="set"
              offText="not set"
            />,
          ],
          [
            "COPILOTKIT_LICENSE_TOKEN",
            <Pill
              key="lic"
              on={HAS_LICENSE_TOKEN}
              onText="set"
              offText="not set"
            />,
          ],
          [
            "…_PUBLIC_LICENSE_KEY",
            <Pill
              key="public-lic"
              on={HAS_PUBLIC_LICENSE_KEY}
              onText="set"
              offText="not set"
            />,
          ],
          ["Endpoint", <code key="ep">/api/copilotkit/[[...slug]]</code>],
          ["Verbs", <code key="v">GET · POST · PATCH · DELETE</code>],
        ]}
      />

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
        {INTELLIGENCE_ENABLED ? (
          <>
            Intelligence is on, so threads persist and the{" "}
            <a
              href="/prebuilt-components/copilot-threads-drawer"
              className="text-[var(--accent)] underline underline-offset-4"
            >
              Rich Threads
            </a>{" "}
            routes have real rows to list.
            {!HAS_LICENSE && (
              <>
                {" "}
                Neither license credential is set, though — threads will work
                while the drawer still renders its locked Upgrade view, because
                those are two different checks. Set either{" "}
                <code>COPILOTKIT_LICENSE_TOKEN</code> or{" "}
                <code>NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY</code>.
              </>
            )}
          </>
        ) : (
          <>
            No <code>INTELLIGENCE_API_KEY</code>, so the runtime is in SSE mode
            with an in-memory runner. Every chat route in this harness still
            works; the three Rich Threads routes have nothing durable to list.
            Set the key in <code>frontend/.env.local</code> and restart to
            switch modes.
          </>
        )}
      </p>
    </>
  );
}
