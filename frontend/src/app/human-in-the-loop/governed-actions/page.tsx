// Ported from the CPK-LangGraph-TS harness (PR #25), itself from aws-strands-ts
// (the Governed Action page is framework-neutral; the langgraph-python code
// blocks match it).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, CodeBlock, Panel, TryIt } from "@/components/ui";

const VERDICTS: [string, string][] = [
  ["allow", "Run it, no second prompt. An audit note is optional."],
  ["deny", "Never run it. Surface the reason and let the agent pick another path."],
  ["require_approval", "Draw the card. Run it only once the user says yes."],
];

const HANDLE_APPROVAL = `type ApprovalResponse = {
  approved: boolean;
  actionId: string;
  reference: string;
};

async function handleApproval(action: GovernedAction, response: ApprovalResponse) {
  if (
    response.approved &&
    response.actionId === action.id &&
    response.reference === action.reference
  ) {
    return executeSideEffect(action.tool, action.arguments);
  }

  return {
    skipped: true,
    reason: "The user did not approve this action.",
  };
}`;

export default function Page() {
  return (
    <>
      <RouteHeader path="/human-in-the-loop/governed-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          A checkpoint in front of anything that writes. The agent does not
          perform the side effect itself — it calls{" "}
          <code>approve_governed_action</code> with an envelope describing what
          it wants to do, and the run suspends on that call until a person
          answers. The envelope carries a <code>verdict</code> decided
          upstream, so the UI is rendering a policy decision rather than making
          one: two of the three verdicts resolve without ever showing a button.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The page offers two ways to reach that checkpoint. This route
          implements the tool-call one. The other,{" "}
          <code>useInterrupt</code>, needs a backend that raises an
          interrupt carrying a <code>GovernedAction</code>. LangGraph&apos;s{" "}
          <code>interrupt()</code> can (see{" "}
          <code>/human-in-the-loop/useInterrupt</code>), but this page
          publishes no graph that emits one, so it is left out rather than
          mocked.
        </p>
      </Panel>

      <Panel title="What is real here and what is not">
        <Callout tone="warn" title="The approval works; the governance is a prop">
          <p>
            The mechanism is genuine. The tool registers, the model calls it,
            the run suspends, the card draws, and <code>respond()</code>{" "}
            resumes the turn with the decision attached. That half is testable
            and it passes.
          </p>
          <p className="mt-2">
            The <code>GovernedAction</code> it is gating is not. Nothing in the
            LangGraph Python docs publishes a policy engine, a tool that
            emits one of these envelopes, or the{" "}
            <code>executeSideEffect</code> that the page&apos;s own server
            sample calls. So <code>verdict</code>, <code>reference</code> and{" "}
            <code>id</code> arrive as whatever the model decided to put in the
            tool call — which means the card can cheerfully render{" "}
            <em>Allowed by policy</em> on the strength of an LLM&apos;s
            say-so. Treat this route as proof the approval surface works, not
            as a governed action.
          </p>
        </Callout>
        <Callout tone="info" title="ToolCallStatus does come from /v2">
          <p>
            Worth recording because it looks like a bug and is not. The enum is
            nowhere in the export list that{" "}
            <code>@copilotkit/react-core/v2</code> spells out, so grepping the
            bundle for it finds nothing — but{" "}
            <code>dist/v2/index.mjs</code> carries{" "}
            <code>export * from &quot;@copilotkit/core&quot;</code> and the
            enum rides in on that, in the types and at runtime alike. Its
            values are <code>inProgress</code>, <code>executing</code> and{" "}
            <code>complete</code>, which is why the repo&apos;s other approval
            route can compare the bare string{" "}
            <code>&quot;executing&quot;</code> and behave identically.
          </p>
        </Callout>
      </Panel>

      <Panel
        title="The demo and the card it renders"
        description="Both are the doc's code. Only the <CopilotChat> and the agentId are this repo's."
      >
        <SourceCodeGroup
          files={[
            {
              file: "frontend/src/app/human-in-the-loop/governed-actions/demo-chat/page.tsx",
            },
            {
              file: "frontend/src/app/human-in-the-loop/governed-actions/governed-action-card.tsx",
            },
          ]}
        />
        <div className="mt-4">
          <TryIt
            prompts={[
              "Email carol@northwind.test to confirm her refund of $420 on order NW-8812.",
              "Apply a 30% discount to account NW-8812 for the next quarter.",
            ]}
            expect="The agent calls approve_governed_action instead of answering, and the card appears with the arguments it proposed printed underneath. The reply stops there. Approve or reject, and the run resumes with the agent acknowledging your decision — that is respond() having reached it."
            fail="The agent describes sending the email rather than drawing a card (the tool never reached the model), or the card appears and the buttons do nothing (respond() is not wired). A card reading 'Allowed by policy' is not a failure of this route — it is the model picking that verdict unprompted, because nothing computes one."
          />
        </div>
      </Panel>

      <Panel
        title="How the three verdicts are meant to resolve"
        description="The page states this as a table; restated here because it is what makes the card more than a yes/no prompt."
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {["verdict", "What the UI should do"].map((h) => (
                  <th
                    key={h}
                    className="border-b border-slate-200 px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VERDICTS.map(([verdict, behaviour]) => (
                <tr key={verdict}>
                  <td className="border-b border-slate-100 px-2 py-2 font-mono text-xs dark:border-slate-800">
                    {verdict}
                  </td>
                  <td className="border-b border-slate-100 px-2 py-2 dark:border-slate-800">
                    {behaviour}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Note that only <code>require_approval</code> renders buttons. The
          other two are resolved by the <code>useEffect</code> inside{" "}
          <code>GovernedActionCard</code>, which fires <code>onApprove</code> or{" "}
          <code>onBlock</code> as soon as the card mounts — so an{" "}
          <code>allow</code> verdict answers the tool call without the user
          seeing a decision point at all.
        </p>
      </Panel>

      <Panel
        title="The server half, as far as it is published"
        description="Reproduced rather than implemented: its one meaningful call has no definition anywhere in the doc tree."
      >
        <CodeBlock code={HANDLE_APPROVAL} language="ts" />
        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This is the whole of the backend the page gives you. It is a shape,
          not a working handler — <code>executeSideEffect</code> is called here
          and defined on no page, and nothing published anywhere produces a{" "}
          <code>GovernedAction</code> or decides its <code>verdict</code>. The
          agent behind this route is therefore the Quickstart agent under a new
          id, with no governed tool of its own; inventing one would be
          inventing the page&apos;s missing half.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The identity check is worth keeping even so: re-matching{" "}
          <code>actionId</code> and <code>reference</code> before executing is
          what stops an approval for a cheap action being replayed against an
          expensive one.
        </p>
      </Panel>
    </>
  );
}
