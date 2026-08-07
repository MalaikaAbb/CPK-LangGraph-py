"use client";

import {
  CopilotChatConfigurationProvider,
  CopilotSidebar,
  useCopilotChatConfiguration,
} from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's two chat-control patterns on one surface:
 *
 *  1. `useCopilotChatConfiguration()` → `setModalOpen` / `isModalOpen`, so your
 *     own buttons can open and close the prebuilt chat.
 *  2. `messageView.assistantMessage.onThumbsUp / onThumbsDown`, which is what
 *     makes the thumbs buttons render at all — they only appear when a handler
 *     is supplied.
 *
 * **Why the explicit provider.** `useCopilotChatConfiguration()` returns `null`
 * unless a `CopilotChatConfigurationProvider` is above the caller.
 * `<CopilotSidebar>` does create one — but *inside itself*, wrapping only its
 * own subtree. Buttons rendered as its siblings are outside that provider, get
 * `null`, and silently render nothing. With `defaultOpen={false}` the sidebar
 * then has no way to be opened at all, so no assistant message ever exists and
 * the thumbs never appear either.
 *
 * Wrapping the whole surface in an explicit provider is the doc's own
 * prescription for composing chat yourself. The two providers stay in sync
 * automatically: the inner one calls the outer's `setModalOpen` on every
 * change, and mirrors the outer's `isModalOpen` back down via an effect.
 */
type Feedback = { id: string; value: "up" | "down" };

export default function Page() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);

  return (
    <DemoFrame
      parentPath="/prebuilt-components/chat-controls"
      subtitle="graph: chat-controls"
    >
      {/* The provider must wrap BOTH the buttons and the sidebar — that shared
          scope is the entire fix. */}
      <CopilotChatConfigurationProvider
        agentId="chat-controls"
        isModalDefaultOpen={false}
      >
        <div className="flex h-full">
          <main className="min-w-0 flex-1 overflow-y-auto p-8">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Chat controls
            </h2>

            <div className="mt-4 flex flex-wrap gap-2">
              <OpenChatButton />
              <ToggleChatButton />
            </div>

            <section className="mt-8">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Captured feedback
              </h3>
              {feedback.length === 0 ? (
                <p className="mt-2 text-sm italic text-slate-500">
                  Open the chat, send a message, then rate the reply with 👍 / 👎.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {feedback.map((f, i) => (
                    <li
                      key={`${f.id}-${i}`}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-900"
                    >
                      <span>{f.value === "up" ? "👍" : "👎"}</span>
                      <code className="truncate font-mono text-xs text-slate-500">
                        {f.id}
                      </code>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </main>

          <CopilotSidebar
            agentId="chat-controls"
            defaultOpen={false}
            messageView={{
              assistantMessage: {
                onThumbsUp: (message: { id: string }) =>
                  setFeedback((prev) => [
                    ...prev,
                    { id: message.id, value: "up" },
                  ]),
                onThumbsDown: (message: { id: string }) =>
                  setFeedback((prev) => [
                    ...prev,
                    { id: message.id, value: "down" },
                  ]),
              },
            }}
          />
        </div>
      </CopilotChatConfigurationProvider>
    </DemoFrame>
  );
}

function OpenChatButton() {
  const config = useCopilotChatConfiguration();

  // setModalOpen is only present when a provider in the tree owns modal state
  // (the prebuilt CopilotPopup / CopilotSidebar create it for you).
  if (!config?.setModalOpen) return null;

  return (
    <button
      onClick={() => config.setModalOpen(true)}
      className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-white"
    >
      Ask the assistant
    </button>
  );
}

function ToggleChatButton() {
  const config = useCopilotChatConfiguration();
  if (!config?.setModalOpen) return null;

  return (
    <button
      onClick={() => config.setModalOpen(!config.isModalOpen)}
      className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
    >
      {config.isModalOpen ? "Close chat" : "Open chat"}
    </button>
  );
}
