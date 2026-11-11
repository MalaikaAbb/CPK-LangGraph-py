"use client";

import {
  CopilotChat,
  CopilotChatToolCallsView,
  type CopilotChatToolCallsViewProps,
  useFrontendTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

/**
 * The page's "Tool calls" slot example (added November 2026).
 *
 * `CustomToolCallsView` is verbatim: it wraps the default
 * `CopilotChatToolCallsView` in a dashed container and keeps every registered
 * renderer. Two harness additions, labelled:
 *
 * - `agentId="chat-slots"` on `<CopilotChat>`. The page's `Chat` names no
 *   agent, and this runtime registers no `default` agent.
 * - `ToolCallsDemo` registers one frontend tool with a `render`, so the
 *   agent has a tool call for the slot to wrap. The page assumes your app
 *   already has tool renderers.
 */

//#region doc
const CustomToolCallsView = (props: CopilotChatToolCallsViewProps) => (
  <div className="rounded-lg border border-dashed p-2">
    <CopilotChatToolCallsView {...props} />
  </div>
);

export function Chat() {
  return (
    <CopilotChat
      agentId="chat-slots" // harness: the page passes no agentId
      messageView={{
        assistantMessage: { toolCallsView: CustomToolCallsView },
      }}
    />
  );
}
//#endregion

//#region harness-tool
export function ToolCallsDemo() {
  useFrontendTool({
    name: "show_weather_card",
    description:
      "Show a small weather card in the chat for a city. Call it whenever the user asks about weather.",
    parameters: z.object({
      city: z.string().describe("The city name."),
    }),
    handler: async ({ city }) => ({ city, temperatureC: 21, sky: "clear" }),
    render: ({ args, status }) => (
      <div className="rounded-md bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
        Weather card for <strong>{args?.city ?? "…"}</strong> ({status})
      </div>
    ),
  });

  return (
    <div className="h-[28rem] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
      <Chat />
    </div>
  );
}
//#endregion
