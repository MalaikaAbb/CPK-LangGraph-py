"use client";

/**
 * ⚠ SELF-DEFINED — not from the CopilotKit docs.
 *
 * The Programmatic Control page's `headless-complete` snippet opens by
 * destructuring three helpers it never defines:
 *
 *   useAttachmentsConfig()   — a thin wrapper over the real `useAttachments`
 *   useAutoScroll(...)       — stick-to-bottom scrolling
 *   buildContent(...)        — text + attachments → an AG-UI content array
 *
 * Only the first has a real counterpart in the package. The other two are
 * rebuilt here from how the snippet uses them, which is the reason the route
 * is marked Partial: the primitives it demonstrates (`addMessage`, `runAgent`,
 * `stopAgent`, `subscribe`) are the doc's, but the scaffolding around them
 * is this repo's guess at code that was never published.
 */

import type { InputContent } from "@ag-ui/core";
import { useAttachments, type Attachment } from "@copilotkit/react-core/v2";
import { useCallback, useEffect, useRef } from "react";

/**
 * The snippet's name for `useAttachments`, which *is* a real export and
 * already returns every field the snippet destructures — including
 * `consumeAttachments`. Kept as a named wrapper so the snippet reads as
 * written rather than being silently rewritten.
 */
export function useAttachmentsConfig() {
  return useAttachments({ config: { enabled: true } });
}

/**
 * Stick-to-bottom scrolling that yields once the user scrolls away.
 *
 * `stickRef` is deliberately a ref rather than state: the send handler flips it
 * to `true` on submit, and a state update there would re-render mid-dispatch.
 * The snippet relies on exactly that — it writes `stickRef.current = true`
 * inside `sendText`.
 */
export function useAutoScroll(messages: unknown[], isRunning: boolean) {
  const listRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef(true);

  // Stop following as soon as the user scrolls up; resume when they return.
  const onScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    stickRef.current = distanceFromBottom < 40;
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  useEffect(() => {
    if (!stickRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, isRunning]);

  return { listRef, bottomRef, stickRef };
}

/**
 * Text plus any ready attachments, in the shape `agent.addMessage` wants.
 *
 * Returns a plain string when there are no attachments — the common case, and
 * it avoids wrapping every ordinary message in a one-element array.
 *
 * The one cast: `Attachment.type` is a broad modality string, while
 * `InputContent` is a discriminated union keyed on that same field. They line
 * up at runtime (the attachment hook only ever produces valid modalities) but
 * TypeScript cannot see it, so the assembled array is asserted once here
 * rather than per-part.
 */
export function buildContent(
  text: string,
  attachments: Attachment[],
): string | InputContent[] {
  if (attachments.length === 0) return text;

  const parts: unknown[] = [];
  if (text) parts.push({ type: "text", text });

  for (const a of attachments) {
    parts.push({
      type: a.type,
      source: a.source,
      metadata: { filename: a.filename, size: a.size },
    });
  }
  return parts as InputContent[];
}
