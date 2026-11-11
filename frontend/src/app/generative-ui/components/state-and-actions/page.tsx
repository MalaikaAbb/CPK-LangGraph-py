// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

const BASE = "frontend/src/app/generative-ui/components/state-and-actions/demo-chat";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/components/state-and-actions" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Generated components can be wired back into the app. A catalog can
          declare <strong>state</strong> that your code fills and the agent
          never sets; <strong>functions</strong> that a component&apos;s event
          calls in the browser; <strong>events</strong> that, when no function
          matches, turn a click into a message to the agent; and{" "}
          <strong>writable</strong> props whose user edits stick.
        </p>
        <div className="mt-4 space-y-3">
          <TryIt
            prompts={["(App state) add p1 twice, then: show product cards for p1 Trail Runner and p2 City Sneaker"]}
            expect="Trail Runner's card reads 'In cart: 2' and City Sneaker's 'In cart: 0'. Pressing + p2 afterwards updates the card without a new run."
            fail="'In cart' missing or wrong — the bind selector did not run, or the agent set inCart itself."
          />
          <TryIt
            prompts={["(Run code on click) show product cards for p1 Trail Runner and p3 Track Spike"]}
            expect="Each card's Add to cart button adds that product to the Cart panel, and no new chat message appears."
            fail="A chat message appears on click — the event did not match addToCart."
          />
          <TryIt
            prompts={["(Send a click) show plan cards for Starter and Team"]}
            expect="Choosing a plan posts a visible user message and the agent answers it."
          />
          <TryIt
            prompts={["(Writable) show a checkout form with the email set to me@example.com"]}
            expect="The input starts with the agent's value and keeps whatever you type; asking the agent to change the email afterwards does not overwrite your edit."
          />
        </div>
      </Panel>

      <Panel title="The page's code">
        <SourceCodeGroup
          files={[
            { file: `${BASE}/state-catalog.tsx` },
            { file: `${BASE}/functions-catalog.tsx` },
            { file: `${BASE}/declarations.ts` },
            { file: `${BASE}/events-catalog.tsx` },
            { file: `${BASE}/writable-catalog.tsx` },
            { file: `${BASE}/layout-catalogs.ts` },
          ]}
        />
      </Panel>

      <Panel title="The demo">
        <SourceCodeGroup files={[{ file: `${BASE}/page.tsx` }, { file: `${BASE}/sections.tsx` }]} />
      </Panel>

      <Callout tone="warn" title="Gaps and harness changes">
        <ul className="space-y-1.5">
          <li>
            · Every snippet omits some imports (<code>z</code>,{" "}
            <code>createGenerativeUI</code>, <code>Cart</code>); added and marked.
          </li>
          <li>
            · The state catalog uses a <code>ProductCard</code> the page never
            prints; scaffolding renders <code>inCart</code>.
          </li>
          <li>
            · <code>Cart</code> and <code>cart.addItem</code> are undefined; a
            React-state cart stands in.
          </li>
          <li>
            · &ldquo;Who may call&rdquo;, &ldquo;Send a click&rdquo; and
            &ldquo;Keep what the user types&rdquo; are fragments; the catalogs
            around them (and <code>PlanCard</code>) are scaffolding.
          </li>
          <li>
            · The state and functions catalogs declare only{" "}
            <code>ProductCard</code>, and a surface has one root, so two cards
            have nothing to sit in: the agent invents a container and the
            browser rejects the <code>createSurface</code>. Those two tabs give
            the provider a harness wrapper (<code>layout-catalogs.ts</code>)
            that extends the published catalog with <code>standardUI</code>;
            the published catalogs are unchanged.
          </li>
          <li>
            · The page says the agent cannot call renderer functions in this
            version whatever <code>allowedCallers</code> says, so the
            declarations are shown as exported rather than exercised.
          </li>
        </ul>
      </Callout>
    </>
  );
}
