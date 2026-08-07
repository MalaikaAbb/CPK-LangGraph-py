"use client";

// Custom `reasoningMessage` slot renderer.
//
// Receives the `ReasoningMessage` plus (optionally) the full message list and
// the running state from the slot system. Renders the content inline as a
// visibly tagged banner so the agent's thinking chain is the focal UI of the
// demo rather than a collapsed card.
//
// `isStreaming` has to be derived: the slot gets no such prop. A block is
// still streaming only if the run is open *and* this is the trailing message.

import type { Message, ReasoningMessage } from "@ag-ui/core";
import React from "react";

export function ReasoningBlock({
  message,
  messages,
  isRunning,
}: {
  message: ReasoningMessage;
  messages?: Message[];
  isRunning?: boolean;
}) {
  const isLatest = messages?.[messages.length - 1]?.id === message.id;
  const isStreaming = !!(isRunning && isLatest);
  const hasContent = !!(message.content && message.content.length > 0);

  return (
    <div
      data-testid="reasoning-block"
      className="my-2 rounded-xl border border-[#DBDBE5] bg-[#BEC2FF1A] px-3.5 py-2.5 text-sm"
    >
      <div className="flex items-center gap-2 font-medium text-[#010507] dark:text-slate-100">
        <span className="inline-block rounded-full border border-[#BEC2FF] bg-white px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#57575B]">
          Reasoning
        </span>
        <span className="text-[#57575B] dark:text-slate-400">
          {isStreaming ? "Thinking…" : hasContent ? "Agent reasoning" : "…"}
        </span>
      </div>
      {hasContent && (
        <div className="mt-1.5 whitespace-pre-wrap italic text-[#57575B] dark:text-slate-400">
          {message.content}
        </div>
      )}
    </div>
  );
}
