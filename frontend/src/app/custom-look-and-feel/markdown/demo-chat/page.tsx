"use client";

import { useState } from "react";

import { DemoFrame } from "@/components/demo-frame";

import { Chat, ClassStringChat, PlainTextChat } from "../examples";

/**
 * The page's three `markdownRenderer` shapes, one tab each.
 *
 * All three talk to the same agent, so the conversation carries over when you
 * switch tabs. The same reply is then drawn by each renderer in turn, which
 * makes the differences easy to compare.
 */
const TABS = [
  { id: "components", label: "components map", Component: Chat },
  { id: "class", label: "class string", Component: ClassStringChat },
  { id: "plain", label: "PlainText renderer", Component: PlainTextChat },
] as const;

export default function Page() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("components");
  const Active = TABS.find((t) => t.id === tab)!.Component;

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/markdown"
      subtitle="agent: chat-markdown"
    >
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <nav className="flex shrink-0 gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-md px-3 py-1 text-xs font-medium ${
                tab === t.id
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <div className="chat-host min-h-0 flex-1">
          <Active key={tab} />
        </div>
      </div>
    </DemoFrame>
  );
}
