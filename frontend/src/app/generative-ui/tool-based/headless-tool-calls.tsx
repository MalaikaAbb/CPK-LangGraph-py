"use client";

import {
  CopilotChatToolCallsView,
  useAgent,
  useComponent,
  useCopilotKit,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { BarChart, barChartPropsSchema } from "./bar-chart";

/**
 * The page's "Rendering in a headless chat" section (added November 2026).
 *
 * A headless chat paints its own message list, so a registered component is
 * called by the agent but never shows up unless something renders the tool
 * call. The page's one line for that is the `<CopilotChatToolCallsView ... />`
 * below, verbatim apart from the variable names. Everything around it (the
 * message list, the input, `send`) is harness glue modelled on this repo's
 * `/custom-look-and-feel/headless-ui` demo; the page shows no surrounding chat.
 */
export function HeadlessToolCalls() {
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });

  const { agent } = useAgent({ agentId: "gen-ui-tool-based" });
  const { copilotkit } = useCopilotKit();
  const [input, setInput] = useState("");
  const allMessages = agent.messages;

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || agent.isRunning) return;
    agent.addMessage({ id: crypto.randomUUID(), role: "user", content: trimmed });
    setInput("");
    void copilotkit.runAgent({ agent }).catch((err) => {
      console.error("[langgraph-python:headless-tool-calls] runAgent failed", err);
    });
  };

  return (
    <div className="flex h-[30rem] flex-col rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        {allMessages.length === 0 && (
          <p className="py-10 text-center text-sm italic text-slate-500">
            No CopilotChat here. Ask for a chart.
          </p>
        )}
        {allMessages.map((m) => {
          if (m.role === "user") {
            return (
              <p
                key={m.id}
                className="ml-auto max-w-[80%] rounded-2xl bg-[var(--accent)] px-3 py-2 text-sm text-white"
              >
                {typeof m.content === "string" ? m.content : "[attachment]"}
              </p>
            );
          }
          if (m.role === "assistant") {
            const assistantMessage = m;
            return (
              <div key={m.id} className="max-w-[90%] space-y-2">
                {assistantMessage.content && (
                  <p className="rounded-2xl bg-white px-3 py-2 text-sm text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    {assistantMessage.content}
                  </p>
                )}
                {/* The page's line: paint this message's tool calls. */}
                <CopilotChatToolCallsView message={assistantMessage} messages={allMessages} />
              </div>
            );
          }
          return null;
        })}
        {agent.isRunning && (
          <p className="text-xs italic text-slate-500">Agent is working…</p>
        )}
      </div>
      <form
        className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Chart the number of days in each month of 2026."
          className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={agent.isRunning}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
