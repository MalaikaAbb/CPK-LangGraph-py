"use client";

import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";
import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { CustomContent, CustomHeader } from "../reasoning-slots";

/**
 * The doc's `reasoning-default` cell, with a toggle so the default card and the
 * two replaced sub-slots can be compared in one session.
 *
 * The page's own default example passes no props at all — the card appears on
 * its own as soon as reasoning events arrive. The "Custom sub-slots" position
 * adds `messageView.reasoningMessage={{ header, contentView }}`, which is the
 * page's partial-override form: replace parts of the card, keep the rest.
 *
 * Replacing the *whole* card instead is a different prop shape (a component
 * rather than an object) and lives on the Generative UI → Reasoning route.
 */
type Mode = "default" | "custom";

export default function Page() {
  const [mode, setMode] = useState<Mode>("default");

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/reasoning-messages"
      subtitle="graph: reasoning-default · o4-mini"
    >
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500">
            reasoningMessage:
          </span>
          {(["default", "custom"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                mode === m
                  ? "bg-[var(--accent)] text-white"
                  : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {m === "default" ? "built-in card" : "custom sub-slots"}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1">
          {/* Remounted on toggle so the comparison starts from a clean thread. */}
          <Chat key={mode} mode={mode} />
        </div>
      </div>
    </DemoFrame>
  );
}

function Chat({ mode }: { mode: Mode }) {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "A puzzle worth thinking about",
        message:
          "A bat and a ball cost $1.10 together. The bat costs $1.00 more than the ball. How much does the ball cost? Show your working.",
      },
      {
        title: "Multi-step arithmetic",
        message:
          "If a train leaves at 14:35 travelling 82 km/h and must cover 227 km, what time does it arrive? Work it through.",
      },
    ],
    available: "always",
  });

  if (mode === "custom") {
    return (
      <CopilotChat
        agentId="reasoning-default"
        className="h-full"
        messageView={{
          reasoningMessage: {
            header: CustomHeader,
            contentView: CustomContent,
          },
        }}
      />
    );
  }

  return <CopilotChat agentId="reasoning-default" className="h-full" />;
}
