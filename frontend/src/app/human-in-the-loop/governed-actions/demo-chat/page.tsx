"use client";

import React from "react";
import { CopilotChat, useConfigureSuggestions } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import { GovernedActionCard } from "../governed-action-card";

/**
 * The page's "Tool-call approval with `useHumanInTheLoop`" block, reproduced.
 *
 * `governedActionSchema` and the whole `GovernedActionTool` function below are
 * the doc's, verbatim — down to the trailing `[]` deps argument.
 *
 * The import resolves, despite `ToolCallStatus` being absent from the export
 * list `@copilotkit/react-core/v2` spells out: `dist/v2/index.mjs` carries
 * `export * from "@copilotkit/core"`, and the enum rides in on that. Worth
 * knowing because grepping the bundle for the symbol finds nothing and looks
 * like a missing export. It is `{ InProgress: "inProgress", Executing:
 * "executing", Complete: "complete" }` — the same three strings the repo's
 * other approval route compares against as literals.
 *
 * Everything the harness added is below `GovernedActionTool`: the suggestions,
 * the `<CopilotChat>`, and the `agentId`. The published block ends at the
 * hook's `return null` with no chat surface of its own.
 *
 * What is NOT real here is the governance. `verdict`, `reference` and `id`
 * arrive as whatever the model puts in the tool call, because no page
 * publishes a policy engine, a tool that emits a `GovernedAction`, or the
 * `executeSideEffect` its own server sample calls. The approval mechanism is
 * genuine; the decision it is gating is invented by the LLM.
 *
 * `GovernedActionCard` is the doc's too — see `../governed-action-card.tsx`
 * for why it is not in this file.
 *
 * Doc: https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/governed-actions
 */

import { ToolCallStatus, useHumanInTheLoop } from "@copilotkit/react-core/v2";
import { z } from "zod";

const governedActionSchema = z.object({
  id: z.string(),
  summary: z.string(),
  tool: z.string(),
  reference: z.string(),
  verdict: z.enum(["allow", "deny", "require_approval"]),
  arguments: z.record(z.unknown()),
});

function GovernedActionTool() {
  useHumanInTheLoop(
    {
      name: "approve_governed_action",
      description:
        "Ask the user to approve a governed side-effect action before it runs.",
      parameters: governedActionSchema,
      render: ({ args, status, respond }) => {
        if (status !== ToolCallStatus.Executing || !respond) {
          return null;
        }

        return (
          <GovernedActionCard
            action={args}
            onApprove={() =>
              respond({
                approved: true,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onReject={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
            onBlock={() =>
              respond({
                approved: false,
                actionId: args.id,
                reference: args.reference,
              })
            }
          />
        );
      },
    },
    [],
  );

  return null;
}

function Chat() {
  useConfigureSuggestions({
    suggestions: [
      {
        title: "Send a refund email",
        message:
          "Email carol@northwind.test to confirm her refund of $420 on order NW-8812.",
      },
      {
        title: "Apply a discount",
        message: "Apply a 30% discount to account NW-8812 for the next quarter.",
      },
    ],
    available: "always",
  });

  return (
    <>
      <GovernedActionTool />
      <CopilotChat agentId="governed-actions" />
    </>
  );
}

export default function GovernedActionsDemo() {
  return (
    <DemoFrame
      parentPath="/human-in-the-loop/governed-actions"
      subtitle="agent: governed-actions"
    >
      <div className="chat-host mx-auto h-full max-w-3xl">
        <Chat />
      </div>
    </DemoFrame>
  );
}
