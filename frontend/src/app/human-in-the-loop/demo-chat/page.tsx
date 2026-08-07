"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  useHumanInTheLoop,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { TimePickerCard, type TimeSlot } from "../time-picker-card";

/**
 * The doc's `hitl-in-chat` cell, reproduced.
 *
 * `useHumanInTheLoop` is a frontend tool that does not return until the user
 * answers. The model calls `book_call`, CopilotKit routes the call through
 * `render`, and the run genuinely suspends — nothing further streams — until
 * `respond` is called with the user's choice, which the agent then sees as the
 * tool result.
 *
 * This is the *model-initiated* pause. Compare the Interrupts route, where the
 * graph decides to stop regardless of what the model wanted.
 *
 * The slots are the page's fixed list: "just data the demo page owns, so you
 * can swap in real availability, a calendar API, or anything else".
 */
const DEFAULT_SLOTS: TimeSlot[] = [
  { label: "Tomorrow 10:00 AM", iso: "2026-04-19T10:00:00-07:00" },
  { label: "Tomorrow 2:00 PM", iso: "2026-04-19T14:00:00-07:00" },
  { label: "Monday 9:00 AM", iso: "2026-04-21T09:00:00-07:00" },
  { label: "Monday 3:30 PM", iso: "2026-04-21T15:30:00-07:00" },
];

/**
 * The argument type has to be supplied explicitly. Unlike `useRenderTool`,
 * `useHumanInTheLoop` does not infer it from `parameters` — it defaults to
 * `Record<string, unknown>`, so `args.topic` would be `unknown` and unusable in
 * JSX. The docs sidestep this by typing the render props `any`. See README §9.
 */
type BookCallArgs = { topic: string; attendee: string };

export default function Page() {
  return (
    <DemoFrame parentPath="/human-in-the-loop" subtitle="graph: hitl-in-chat">
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Book a call with sales",
        message:
          "Please book an intro call with the sales team to discuss pricing.",
      },
      {
        title: "Schedule a 1:1 with Alice",
        message: "Schedule a 1:1 with Alice next week to review Q2 goals.",
      },
    ],
    available: "always",
  });

  useHumanInTheLoop<BookCallArgs>({
    agentId: "hitl-in-chat",
    name: "book_call",
    description:
      "Ask the user to pick a time slot for a call. The picker UI presents fixed candidate slots; the user's choice is returned to the agent.",
    parameters: z.object({
      topic: z
        .string()
        .describe("What the call is about (e.g. 'Intro with sales')"),
      attendee: z
        .string()
        .describe("Who the call is with (e.g. 'Alice from Sales')"),
    }),
    render: ({ args, status, respond }) => (
      <TimePickerCard
        topic={args?.topic ?? "a call"}
        attendee={args?.attendee}
        slots={DEFAULT_SLOTS}
        status={status}
        onSubmit={(result) => respond?.(result)}
      />
    ),
  });

  return <CopilotChat agentId="hitl-in-chat" className="h-full" />;
}
