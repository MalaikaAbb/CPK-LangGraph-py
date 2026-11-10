import { RouteHeader } from "@/components/route-header";
import { SourceCodeGroup } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/mcp-apps" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          MCP servers whose tools carry UI resources. The runtime&apos;s{" "}
          <code>mcpApps.servers</code> config applies the MCP Apps middleware:
          when the agent calls such a tool, the middleware fetches the resource
          and emits an activity event, and the built-in renderer shows it as a
          sandboxed iframe in the chat. The demo points at the public Excalidraw
          MCP app (override with <code>MCP_SERVER_URL</code>).
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Draw a simple flowchart of a login process in Excalidraw"]}
            expect="An Excalidraw canvas renders inline in the chat as an iframe."
            fail="A text answer with no iframe (the MCP tool was not called or the middleware is off), or a runtime error reaching mcp.excalidraw.com (network)."
          />
        </div>
      </Panel>

      <Callout tone="info" title="Code tab verbatim; two files borrowed">
        <p>
          Agent, runtime route and demo page are the page&apos;s Code tab. The
          demo imports <code>./chat</code>, which the tab does not show, so{" "}
          a minimal <code>chat.tsx</code> (a bare <code>&lt;CopilotChat&gt;</code>)
          is adapted from the CopilotKit showcase (via the CPK-LangGraph-TS
          harness), without the showcase&apos;s suggestion chips. The agent is
          the Code tab&apos;s Python file; the runtime route builds its agents
          with <code>buildAgents</code> so the FastAPI transport works. The runtime
          route also registers a <code>headless_complete</code> graph that this
          repo does not have (its id here is <code>headless-complete</code>);
          only the <code>mcp-apps</code> agent is used. See README §9.
        </p>
      </Callout>

      <Panel title="Runtime, agent, demo">
        <SourceCodeGroup
          files={[
            { file: "frontend/src/app/api/copilotkit-mcp-apps/[[...slug]]/route.ts" },
            { file: "backend/src/agents/mcp_apps_agent.py" },
            { file: "frontend/src/app/generative-ui/mcp-apps/demo-chat/page.tsx" },
            { file: "frontend/src/app/generative-ui/mcp-apps/demo-chat/chat.tsx" },
          ]}
        />
      </Panel>
    </>
  );
}
