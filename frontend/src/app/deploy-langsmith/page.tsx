import Link from "next/link";

import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference route: deploying needs a LangSmith account and `langgraph deploy`.
 * The page's code is kept verbatim under docs-verbatim/deploy-langsmith/.
 * Layout follows the CPK-LangGraph-TS harness's version of this page.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/deploy-langsmith" />

      <Callout tone="premium" title="Requires a LangSmith deployment — not testable locally">
        <p>
          <code>langgraph deploy</code> pushes the graph to a LangSmith
          deployment you need an account for. The frontend half is the same{" "}
          <code>LangGraphAgent</code> wiring this repo already uses for its
          LangSmith transport (<code>LANGGRAPH_TRANSPORT=langsmith</code> with{" "}
          <code>langgraph dev</code>, see{" "}
          <Link href="/quickstart" className="text-[var(--accent)] underline underline-offset-4">
            Quickstart
          </Link>
          ), so that part is exercised locally; the hosted deployment is not.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Browser → CopilotKit runtime → LangSmith deployment → agent. Install
          the LangGraph CLI, start from a template, name the graph in{" "}
          <code>langgraph.json</code>, deploy, then register a{" "}
          <code>LangGraphAgent</code> whose <code>graphId</code> matches a key
          under <code>graphs</code>. It also covers a Google ADK agent wrapped
          for LangSmith, running locally with <code>langgraph dev</code>, and
          self-hosting behind FastAPI with{" "}
          <code>add_langgraph_fastapi_endpoint</code>.
        </p>
      </Panel>

      <Panel title="Deploy">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/install-cli.sh" },
            { file: "docs-verbatim/deploy-langsmith/new-project.sh" },
            { file: "docs-verbatim/deploy-langsmith/langgraph.json" },
            { file: "docs-verbatim/deploy-langsmith/env.example" },
            { file: "docs-verbatim/deploy-langsmith/deploy.sh" },
          ]}
        />
      </Panel>

      <Panel title="Connect the frontend">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/install-frontend.sh" },
            { file: "docs-verbatim/deploy-langsmith/route.ts" },
            { file: "docs-verbatim/deploy-langsmith/providers.tsx" },
            { file: "docs-verbatim/deploy-langsmith/layout.tsx" },
            { file: "docs-verbatim/deploy-langsmith/page.tsx" },
            { file: "docs-verbatim/deploy-langsmith/env.local" },
          ]}
          note="This repo's own LangSmith-transport wiring is frontend/src/lib/runtime-agents.ts (LangGraphAgent per graph id)."
        />
      </Panel>

      <Panel title="Google ADK on LangSmith">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/adk-install.sh" },
            { file: "docs-verbatim/deploy-langsmith/adk-agent.py" },
            { file: "docs-verbatim/deploy-langsmith/adk-langgraph.json" },
            { file: "docs-verbatim/deploy-langsmith/adk-local-dev.sh" },
          ]}
        />
      </Panel>

      <Panel title="Run locally or self-host">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-langsmith/local-dev-python.sh" },
            { file: "docs-verbatim/deploy-langsmith/local-env.example" },
            { file: "docs-verbatim/deploy-langsmith/server.py" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Things to check before copying">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <code>server.py</code> defines <code>main()</code> with{" "}
            <code>uvicorn.run(&quot;sample_agent.demo:app&quot;, …)</code> but never calls it, and
            that module path does not match the file the snippet is in.
          </li>
          <li>
            <code>route.ts</code> exports only <code>GET</code> and{" "}
            <code>POST</code> from a catch-all route; thread rename and delete
            need <code>PATCH</code>/<code>DELETE</code> too.
          </li>
          <li>
            Self-hosting here is what this repo&apos;s FastAPI transport already
            does (<code>backend/main.py</code>).
          </li>
        </ul>
      </Callout>
    </>
  );
}
