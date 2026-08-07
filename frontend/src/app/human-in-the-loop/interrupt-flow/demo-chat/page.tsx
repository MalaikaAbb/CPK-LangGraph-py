"use client";

import {
  CopilotChat,
  useAgent,
  useInterrupt,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

const AGENT_ID = "interrupt-flow";

/**
 * Both of the Interrupts page's `useInterrupt` examples, side by side.
 *
 * - **Single** — the page's main walkthrough: one hook, no `enabled`, the
 *   payload rendered straight into a form. Works.
 * - **Multiple** — the page's "Condition UI executions" section: two hooks
 *   split by an `enabled` predicate. Reproduced verbatim, and it never fires.
 *   That is the finding, not a transcription error; see README §9 item 1 and
 *   the notes page.
 *
 * Each variant is its own component, so switching tabs genuinely unmounts one
 * set of hooks and mounts the other — `useInterrupt` cannot be called
 * conditionally.
 */
type Tab = "single" | "multiple";

export default function Page() {
  const [tab, setTab] = useState<Tab>("single");

  return (
    <DemoFrame
      parentPath="/human-in-the-loop/interrupt-flow"
      subtitle={`graph: ${AGENT_ID} · native interrupt()`}
    >
      <div className="flex h-full min-h-0 flex-col">
        <TabBar tab={tab} onChange={setTab} />
        {tab === "single" ? (
          <SingleInterruptTab key="single" />
        ) : (
          <MultipleInterruptTab key="multiple" />
        )}
      </div>
    </DemoFrame>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "single", label: "Single interrupt" },
    { id: "multiple", label: "Multiple interrupts" },
  ];

  return (
    <div className="flex shrink-0 gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-md px-3 py-1 text-xs font-medium ${
            tab === t.id
              ? "bg-[var(--accent)] text-white"
              : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 — the page's main example. One hook, no predicate.
// ---------------------------------------------------------------------------

function SingleInterruptTab() {
  const [resolved, setResolved] = useState<string[]>([]);

  // styles omitted for brevity
  useInterrupt({
    agentId: AGENT_ID,
    render: ({ event, resolve }) => (
      <div>
        <p>{event.value as string}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const answer = (e.target as HTMLFormElement).response.value;
            // Not the doc's — a local log so the round trip stays visible
            // after the form unmounts.
            setResolved((prev) => [...prev, String(answer)]);
            resolve(answer);
          }}
        >
          <input type="text" name="response" placeholder="Enter your response" />
          <button type="submit">Submit</button>
        </form>
      </div>
    ),
  });

  return (
    <Shell
      heading="interrupts resolved"
      blurb={
        <>
          One hook, no <code>enabled</code>, so it claims every interrupt. Note
          what renders in the form: <code>event.value</code> arrives
          JSON-stringified, so the raw{" "}
          <code>{`{"type":"approval","content":"…"}`}</code> is printed rather
          than the message. That is faithful to the page — it only ever shows{" "}
          <code>{"{event.value}"}</code>.
        </>
      }
      resolved={resolved}
      emptyLog="Send any message to trip the first interrupt."
    />
  );
}

type InterruptValue = { type?: string; content?: string };

function readValue(raw: unknown): InterruptValue {
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as InterruptValue;
    } catch {
      return { content: raw };
    }
  }
  return (raw ?? {}) as InterruptValue;
}


// ---------------------------------------------------------------------------
// Tab 2 — the page's "Condition UI executions" section, verbatim.
// ---------------------------------------------------------------------------

function MultipleInterruptTab() {
  useInterrupt({
    agentId: AGENT_ID,
    // @ts-expect-error — published as-is, and this is the proof: the shipped
    // predicate receives the legacy event (`{ name, value }`), so `eventValue`
    // is not a property. TypeScript rejects the doc's own snippet. Removing
    // this directive does not fix the tab — it stops the whole app compiling.
    enabled: ({ eventValue }) => eventValue.type === "ask",
    render: ({ event, resolve }) => (
      <AskComponent
        question={(event.value as { content: string }).content}
        onAnswer={(answer) => resolve(answer)}
      />
    ),
  });

  useInterrupt({
    agentId: AGENT_ID,
    // @ts-expect-error — same as above.
    enabled: ({ eventValue }) => eventValue.type === "approval",
    render: ({ event, resolve }) => (
      <ApproveComponent
        content={(event.value as { content: string }).content}
        onAnswer={(answer) => resolve(answer)}
      />
    ),
  });


  return (
    <Shell
      heading="doc verbatim — expect nothing"
      blurb={
        <>
          Both predicates destructure <code>eventValue</code>, which the shipped
          hook does not pass, so both return <code>false</code> and neither card
          mounts. The graph still interrupts and the browser still receives the{" "}
          <code>on_interrupt</code> event — check the Inspector — so the run
          simply stalls with nothing on screen and no error.
        </>
      }
      resolved={[]}
      emptyLog="Send a message. Nothing will appear. That is the bug this tab exists to show."
    />
  );
}

// ---------------------------------------------------------------------------
// Shared chrome.
// ---------------------------------------------------------------------------

function Shell({
  heading,
  blurb,
  resolved,
  emptyLog,
}: {
  heading: string;
  blurb: React.ReactNode;
  resolved: string[];
  emptyLog: string;
}) {
  const { agent } = useAgent({ agentId: AGENT_ID });

  // The graph stores `agent_name` and `approval`, so interrupts fire only on a
  // thread that has neither. Without this the second tab would look broken for
  // the wrong reason — the first tab having already answered both.
  const reset = () => {
    agent.setMessages([]);
    agent.setState({
      ...(agent.state ?? {}),
      agent_name: undefined,
      approval: undefined,
    });
  };

  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[22rem_1fr]">
      <aside className="min-h-0 overflow-y-auto border-b border-slate-200 p-6 lg:border-b-0 lg:border-r dark:border-slate-800">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
            {heading}
          </h2>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300"
          >
            Reset thread
          </button>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-slate-500">{blurb}</p>

        <p className="mt-3 text-[11px] text-slate-400">
          Interrupts fire once per thread. Press <strong>Reset thread</strong>{" "}
          before switching tabs, or the next tab has nothing left to interrupt
          on.
        </p>

        <ul className="mt-4 space-y-2">
          {resolved.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-300 px-3 py-8 text-center text-xs text-slate-400 dark:border-slate-700">
              {emptyLog}
            </li>
          ) : (
            resolved.map((entry, i) => (
              <li
                key={i}
                className="flex gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              >
                <span className="select-none text-slate-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="break-all">{entry}</span>
              </li>
            ))
          )}
        </ul>
      </aside>

      <div className="min-h-0">
        <CopilotChat agentId={AGENT_ID} className="h-full" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// The doc's components for the multi-interrupt example. Structure is the
// page's; it prints them with "styles omitted for brevity".
// ---------------------------------------------------------------------------

const AskComponent = ({
  question,
  onAnswer,
}: {
  question: string;
  onAnswer: (answer: string) => void;
}) => (
  // styles omitted for brevity
  <div>
    <p>{question}</p>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onAnswer((e.target as HTMLFormElement).response.value);
      }}
    >
      <input type="text" name="response" placeholder="Enter your response" />
      <button type="submit">Submit</button>
    </form>
  </div>
);

const ApproveComponent = ({
  content,
  onAnswer,
}: {
  content: string;
  onAnswer: (approved: boolean) => void;
}) => (
  // styles omitted for brevity
  <div>
    <h1>Do you approve?</h1>
    <p>{content}</p>
    <button onClick={() => onAnswer(true)}>Approve</button>
    <button onClick={() => onAnswer(false)}>Reject</button>
  </div>
);
