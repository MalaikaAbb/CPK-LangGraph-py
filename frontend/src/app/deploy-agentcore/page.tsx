import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel } from "@/components/ui";

/**
 * Reference route: deploying to AWS Bedrock AgentCore needs an AWS account,
 * CDK bootstrap and Cognito, none of which a local harness has. The page's
 * code is kept verbatim under docs-verbatim/deploy-agentcore/ and shown here.
 * Layout follows the CPK-LangGraph-TS harness's version of this page.
 */
export default function Page() {
  return (
    <>
      <RouteHeader path="/deploy-agentcore" />

      <Callout tone="premium" title="Requires an AWS account — not testable locally">
        <p>
          The page either scaffolds a separate project with{" "}
          <code>npx copilotkit@latest create -f agentcore-langgraph</code> and
          deploys it with CDK, or points a Next.js runtime at an agent you have
          already deployed to AgentCore. Nothing in this repo runs on
          AgentCore; the code below is reference only and is not compiled.
        </p>
      </Callout>

      <Panel title="What the page teaches">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          The request path becomes browser → CopilotKit runtime → AgentCore
          runtime → agent. The runtime has to sit server-side because AgentCore
          wants SigV4 or OAuth2 signing, which a browser cannot do. For an
          existing agent, the runtime registers an <code>HttpAgent</code>{" "}
          pointed at the AgentCore <code>/invocations</code> URL with a bearer
          token, plus a custom <code>AgentCoreRunner</code> that answers{" "}
          <code>connect</code> for unknown threads with an empty snapshot and
          replays empty tool results on reconnect. The page also explains the
          AWS-side 401 &quot;Missing Authentication Token&quot;.
        </p>
      </Panel>

      <Panel title="Start from scratch: scaffold, configure, deploy, tear down">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-agentcore/create-langgraph.sh" },
            { file: "docs-verbatim/deploy-agentcore/config.yaml" },
            { file: "docs-verbatim/deploy-agentcore/deploy-langgraph.sh" },
            { file: "docs-verbatim/deploy-agentcore/local-docker.sh" },
            { file: "docs-verbatim/deploy-agentcore/destroy.sh" },
          ]}
          note="The page also offers Strands variants (create-strands.sh, deploy-strands.sh, in the same folder); they are not LangGraph."
        />
      </Panel>

      <Panel title="I already have an agent: the runtime side">
        <SourceCodeGroup
          files={[
            { file: "docs-verbatim/deploy-agentcore/install-existing-agent.sh" },
            { file: "docs-verbatim/deploy-agentcore/route.ts" },
            { file: "docs-verbatim/deploy-agentcore/agent-core-runner.ts" },
            { file: "docs-verbatim/deploy-agentcore/providers.tsx" },
            { file: "docs-verbatim/deploy-agentcore/layout.tsx" },
            { file: "docs-verbatim/deploy-agentcore/page.tsx" },
            { file: "docs-verbatim/deploy-agentcore/env.local" },
          ]}
        />
      </Panel>

      <Callout tone="warn" title="Things to check before copying the runtime code">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            The install line pins <code>@ag-ui/client@1.0.2</code>. That must
            match the version your <code>@copilotkit/*</code> packages pin
            exactly, or two copies of <code>AbstractAgent</code> get installed
            (this repo pins 0.0.57 for CopilotKit 1.70.0).
          </li>
          <li>
            <code>route.ts</code> imports <code>InMemoryAgentRunner</code> and
            never uses it, and exports only <code>GET</code> and{" "}
            <code>POST</code> from a catch-all route; thread rename and delete
            need <code>PATCH</code>/<code>DELETE</code> too.
          </li>
          <li>
            Not compiled here: <code>docs-verbatim/</code> sits outside the
            frontend&apos;s <code>tsconfig</code>.
          </li>
        </ul>
      </Callout>

      <Panel title="Troubleshooting: the 401">
        <SourceCodeGroup files={[{ file: "docs-verbatim/deploy-agentcore/401-error.txt" }]} />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          That is AWS answering, not CopilotKit: no token reached it (an unset{" "}
          <code>AGENTCORE_ACCESS_TOKEN</code> becomes{" "}
          <code>Bearer undefined</code>), the Cognito token expired, the URL
          stops short of <code>/invocations</code>, or the browser is calling
          AgentCore directly.
        </p>
      </Panel>
    </>
  );
}
