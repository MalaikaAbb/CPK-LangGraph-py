"use client";

// "Send a click to the agent": the page prints an `events:` fragment only.
// The PlanCard component and the catalog around it are repo-authored
// scaffolding; the `onChoose` declaration is verbatim. No function named
// `choose` exists, so a click becomes a user message to the agent.
//
// The catalog extends `standardUI` (the Catalogs page's "Combine catalogs"
// pattern) so the agent has Row/Column to hold several PlanCards under one
// surface root. Without a container it invented a `div` root, the renderer
// rejected `createSurface`, and nothing rendered.
import { z } from "zod";
import {
  createGenerativeUI,
  standardUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

/** Repo-authored scaffolding: a component that fires the page's `onChoose` event. */
function PlanCard({ plan, onChoose }: GenerativeUIComponentProps<typeof plansUI, "PlanCard">) {
  return (
    <article className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
      <h4 className="font-medium">{plan}</h4>
      <button
        type="button"
        className="mt-2 rounded border px-2 py-1 text-xs"
        onClick={() => onChoose?.({ plan })}
      >
        Choose {plan}
      </button>
    </article>
  );
}

export const plansUI = createGenerativeUI({
  id: "harness/plans@1",
  extends: [standardUI],
  components: {
    PlanCard: {
      component: PlanCard,
      description: "One pricing plan the user can choose.",
      props: z.object({ plan: z.string() }),
      events: {
        onChoose: {
          description: "The user picked a plan",
          parameters: z.object({ plan: z.string() }),
        },
      },
    },
  },
});
