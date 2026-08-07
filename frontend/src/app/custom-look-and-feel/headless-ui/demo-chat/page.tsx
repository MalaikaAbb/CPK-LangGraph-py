"use client";

import { useAgent, useCopilotKit } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's `headless-simple` cell: a chat with zero CopilotKit components.
 *
 * Two hooks do all the work — `useAgent` for the conversation and
 * `useCopilotKit` for the runtime handle you call `runAgent` on. The `send`
 * function is reproduced from the page verbatim, console.error and all; the
 * page's comment explains why it logs rather than swallows.
 *
 * The trade-off the page names: you get text and tool calls, nothing else.
 * Reasoning cards, activity messages and custom before/after slots do not
 * appear unless you wire them yourself — that is what its "complete" example
 * covers, and this repo exercises that on the Programmatic Control route.
 */
export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/headless-ui"
      subtitle="graph: headless-simple"
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  const { agent } = useAgent({ agentId: "headless-simple" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      // Silently swallowing errors here would model broken practice; log so a
      // network failure / runtime error / transport disconnect surfaces in the
      // console for the developer.
      console.error("[langgraph-python:headless-simple] runAgent failed", err);
    });
  };

  const visible = agent.messages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [agent.messages, agent.isRunning]);

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      <div className="min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {visible.length === 0 && (
            <p className="py-12 text-center text-sm italic text-slate-500">
              No CopilotKit components on this page — just useAgent and
              useCopilotKit. Say something.
            </p>
          )}
          {visible.map((m) =>
            m.role === "user" ? (
              <UserBubble key={m.id} content={m.content} />
            ) : (
              <AssistantBubble key={m.id} content={m.content} />
            ),
          )}
          {agent.isRunning && (
            <p className="animate-pulse text-xs text-slate-500">Thinking…</p>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <form
        className="shrink-0 border-t border-slate-200 p-4 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message…"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          />
          <button
            type="submit"
            disabled={agent.isRunning}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function UserBubble({ content }: { content: unknown }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[var(--accent)] px-4 py-2.5 text-sm text-white">
        <p className="whitespace-pre-wrap break-words">{asText(content)}</p>
      </div>
    </div>
  );
}

function AssistantBubble({ content }: { content: unknown }) {
  const text = asText(content);
  if (!text.trim()) return null;
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm dark:bg-slate-900 dark:text-slate-200">
        <p className="whitespace-pre-wrap break-words">{text}</p>
      </div>
    </div>
  );
}

/** AG-UI content is a string or an array of parts; this demo renders the text. */
function asText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((p) =>
        p && typeof p === "object" && "text" in p ? String(p.text ?? "") : "",
      )
      .join("");
  }
  return "";
}
