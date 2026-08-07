"use client";

import {
  CopilotChatAssistantMessage,
  CopilotChatInput,
  CopilotChatView,
} from "@copilotkit/react-core/v2";
import type { ComponentProps } from "react";

/**
 * The three slot components the doc page overrides.
 *
 * The page shows how they are wired but never prints their bodies — its snippet
 * opens with `declare const CustomWelcomeScreen: React.ComponentType;` and two
 * siblings. These implementations are therefore this repo's, written so each
 * override is unmistakable on screen, since that is the whole test: you should
 * be able to tell at a glance that a slot took effect. See README §9.
 *
 * Each one wraps rather than replaces the default where it can, which is the
 * practical way to use slots: you keep markdown rendering, the toolbar and the
 * copy button, and only change the chrome.
 */

/**
 * `welcomeScreen` — replaces the empty state shown before the first message.
 *
 * The page notes its version "still renders the default input and suggestions",
 * and that matters: the welcome screen owns the composer in the empty state, so
 * a replacement that drops `input` leaves a chat you cannot type into.
 */
export function CustomWelcomeScreen({
  input,
  suggestionView,
  ...props
}: ComponentProps<typeof CopilotChatView.WelcomeScreen>) {
  return (
    <div className="flex h-full flex-col" {...props}>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 p-6 text-white shadow-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            welcomeScreen slot
          </p>
          <h2 className="mt-2 text-xl font-semibold">
            This panel replaced the default empty state
          </h2>
          <p className="mt-2 text-sm text-white/85">
            Send a message and it disappears — then watch the assistant card and
            the disclaimer, which stay overridden for the rest of the session.
          </p>
        </div>
      </div>
      {/* The defaults still render, so the composer keeps working. */}
      <div className="shrink-0">{suggestionView}</div>
      <div className="shrink-0">{input}</div>
    </div>
  );
}

/**
 * `messageView.assistantMessage` — wraps every assistant reply.
 *
 * Two levels deep, which is what the page means by "slots are recursive". The
 * default component still renders inside, so markdown, the toolbar and the copy
 * button all keep working.
 */
export function CustomAssistantMessage(
  props: ComponentProps<typeof CopilotChatAssistantMessage>,
) {
  return (
    <div className="my-2 rounded-xl border border-violet-200 bg-violet-50/60 p-3 dark:border-violet-900 dark:bg-violet-950/30">
      <span className="inline-block rounded-full border border-violet-300 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
        slot
      </span>
      <div className="mt-2">
        <CopilotChatAssistantMessage {...props} />
      </div>
    </div>
  );
}

/**
 * `input.disclaimer` — a sub-slot two levels inside the composer.
 *
 * Included because it is the override that stays visible once the welcome
 * screen is gone, so it proves the slot system is still in effect mid-session.
 */
export function CustomDisclaimer(
  props: ComponentProps<typeof CopilotChatInput.Disclaimer>,
) {
  return (
    <p
      {...props}
      className="px-3 py-1.5 text-center text-[11px] text-violet-700 dark:text-violet-300"
    >
      ⚡ Custom disclaimer via the{" "}
      <code className="font-mono">input.disclaimer</code> slot
    </p>
  );
}
