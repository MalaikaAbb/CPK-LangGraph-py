"use client";

/**
 * `GovernedAction` and `GovernedActionCard`, copied from the doc page.
 *
 * Both are published — the type under "Action envelope", the component at the
 * bottom of the "Inline approval with `useInterrupt`" block. They live in this
 * file rather than beside the hook because the page's *second* pattern, the
 * `useHumanInTheLoop` one this route implements, renders `GovernedActionCard`
 * without redefining it. Only the `useInterrupt` block defines it, and that
 * block is not implemented here (the page publishes no graph that raises
 * an interrupt with a GovernedAction), so the card had to be lifted out on
 * its own. Ported from the CPK-LangGraph-TS harness (via aws-strands-ts).
 *
 * Two things about it that matter when you look at the rendered route:
 *
 *  - `text-muted-foreground` and `bg-muted` are shadcn/ui theme tokens. This
 *    repo runs Tailwind v4 with no such tokens defined, so those two classes
 *    resolve to nothing and the card renders unstyled in those spots. Left as
 *    published.
 *
 *  - `onBlock` is only ever reached from the `useInterrupt` path, which calls
 *    `cancel()`. Under `useHumanInTheLoop` the page wires it to the same
 *    `respond({ approved: false })` as `onReject`, so on this route the two
 *    are indistinguishable.
 *
 * Doc: https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/governed-actions
 */

import { useEffect } from "react";

export type GovernedAction = {
  id: string;
  summary: string;
  tool: string;
  reference: string;
  verdict: "allow" | "deny" | "require_approval";
  arguments: Record<string, unknown>;
};

export function GovernedActionCard({
  action,
  onApprove,
  onReject,
  onBlock,
}: {
  action: GovernedAction;
  onApprove: () => void;
  onReject: () => void;
  onBlock: () => void;
}) {
  useEffect(() => {
    if (action.verdict === "allow") onApprove();
    if (action.verdict === "deny") onBlock();
  }, [action.id, action.verdict]);

  const status =
    action.verdict === "allow"
      ? "Allowed by policy"
      : action.verdict === "deny"
        ? "Blocked by policy"
        : "User approval required";

  return (
    <section className="rounded-lg border p-4 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium">{status}</p>
        <h3 className="text-base font-semibold">{action.summary}</h3>
        <p className="text-sm text-muted-foreground">Tool: {action.tool}</p>
        <p className="text-sm text-muted-foreground">
          Reference: {action.reference}
        </p>
      </div>

      <pre className="mt-3 overflow-auto rounded bg-muted p-3 text-xs">
        {JSON.stringify(action.arguments, null, 2)}
      </pre>

      {action.verdict === "require_approval" && (
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onApprove}>
            Approve and run
          </button>
          <button type="button" onClick={onReject}>
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
