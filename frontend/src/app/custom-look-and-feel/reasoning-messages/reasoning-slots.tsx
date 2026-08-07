"use client";

import type React from "react";

/**
 * The two reasoning sub-slots the doc page replaces, reproduced from its
 * snippets.
 *
 * The page prints both of these almost exactly as written here — the prop
 * tables for `header` and `contentView` are its, and so are the bodies. Only
 * the class strings have been extended so the override is obvious on screen.
 *
 * The third sub-slot the page documents, `toggle` (the expand/collapse
 * animation wrapper), is left at its default: replacing it means
 * reimplementing the animation, and the page prints no example of doing so.
 */

/**
 * `reasoningMessage.header` — the clickable bar.
 *
 * `onClick` is only present when `hasContent` is true, which is why the
 * chevron-equivalent below is conditional on it.
 */
export function CustomHeader({
  isOpen,
  label,
  hasContent,
  isStreaming,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isOpen?: boolean;
  label?: string;
  hasContent?: boolean;
  isStreaming?: boolean;
}) {
  return (
    <button
      className="flex w-full items-center gap-2 rounded-t-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
      {...props}
    >
      {isStreaming ? "🧠" : "💡"}
      <span>{label}</span>
      {hasContent && (
        <span className="ml-auto text-xs opacity-70">
          {isOpen ? "Hide" : "Show"}
        </span>
      )}
    </button>
  );
}

/**
 * `reasoningMessage.contentView` — the reasoning text area.
 *
 * `children` is the raw reasoning text. Returning `null` before anything has
 * arrived is the page's own guard, and it matters: without it you get an empty
 * bordered box on every turn, including turns where the model never deliberated.
 */
export function CustomContent({
  isStreaming,
  hasContent,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  isStreaming?: boolean;
  hasContent?: boolean;
}) {
  if (!hasContent && !isStreaming) return null;

  return (
    <div
      className="border-t border-amber-200 bg-amber-50/50 px-4 pb-3 pt-2 font-mono text-sm text-slate-600 dark:border-amber-900 dark:bg-amber-950/20 dark:text-slate-400"
      {...props}
    >
      {children}
      {isStreaming && <span className="ml-1 animate-pulse">▊</span>}
    </div>
  );
}
