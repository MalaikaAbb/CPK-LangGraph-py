"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  type CopilotChatReasoningMessage,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { ReasoningBlock } from "../reasoning-block";

/**
 * The doc's `reasoning-custom` cell, reproduced.
 *
 * The contrast with the Reasoning Messages route is the prop *shape*: passing
 * an object to `messageView.reasoningMessage` replaces parts of the built-in
 * card, while passing a component — as here — replaces the whole thing. There
 * is no card, no chevron and no collapse; `ReasoningBlock` draws an
 * always-open banner instead.
 *
 * The `as unknown as` cast is the page's and is required for the same reason
 * documented on the Slots route: the slot is typed against the default
 * component including its namespace statics.
 */
const AGENT_ID = "reasoning-custom";

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/reasoning"
      subtitle="graph: reasoning-custom · o4-mini"
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "A puzzle worth thinking about",
        message:
          "Three switches downstairs control three bulbs upstairs. You may go up only once. How do you tell which switch controls which bulb? Reason it through.",
      },
      {
        title: "Compare two options",
        message:
          "Should a small team pick a monolith or microservices? Weigh it up properly before answering.",
      },
    ],
    available: "always",
  });

  return (
    <CopilotChat
      agentId={AGENT_ID}
      className="h-full"
      messageView={{
        reasoningMessage:
          ReasoningBlock as unknown as typeof CopilotChatReasoningMessage,
      }}
    />
  );
}
