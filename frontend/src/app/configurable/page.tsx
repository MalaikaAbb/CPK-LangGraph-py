import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/configurable" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Which channel each kind of value should take into a LangGraph agent.
          The page now treats anything the browser puts in{" "}
          <code>forwardedProps.config</code> as untrusted: preferences the model
          should see go through agent context, credentials through an{" "}
          <code>Authorization</code> header, and graph execution settings are
          set by the trusted backend serving the graph.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          This route exercises the third row. The browser sends only the chat
          message. The FastAPI server builds a request-local{" "}
          <code>LangGraphAGUIAgent</code> with the page&apos;s{" "}
          <code>build_agent(tenant_id)</code>, so <code>tenant_id</code> and a{" "}
          <code>recursion_limit</code> of 50 come from the server, and the node
          reads them from <code>config</code>.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["What tenant and recursion limit did the server give you?"]}
            expect="The left panel shows tenant_id tenant-demo (or CONFIGURABLE_TENANT_ID from backend/.env) and recursion_limit 50, and the agent reports the same values. The browser's request body carries neither."
            fail="The run errors with KeyError: 'tenant_id' — the request went through a plain add_langgraph_fastapi_endpoint mount (or langgraph dev) instead of the request-local endpoint in backend/main.py."
          />
        </div>
      </Panel>

      <Callout tone="warn" title="Part of this route is the harness's, not the page's">
        <p>
          The page publishes <code>build_agent</code> and a node that reads{" "}
          <code>tenant_id</code> and returns state unchanged. It leaves{" "}
          <code>graph</code> and <code>AgentState</code> undefined, defers the
          per-request wiring to the Authentication guide, and its node never
          replies. The reply node, the per-request endpoint (shaped like the
          Authentication page&apos;s self-hosted route) and the env-var stand-in
          for an authenticated tenant are repo glue. See README §9.
        </p>
      </Callout>

      <Panel title="The page's build_agent — verbatim">
        <SourceCode file="backend/src/graphs/configurable.py" region="build-agent" />
      </Panel>

      <Panel title="The page's node — verbatim">
        <SourceCode file="backend/src/graphs/configurable.py" region="node" />
      </Panel>

      <Panel title="Where the trusted server builds the agent (harness glue)">
        <SourceCode file="backend/main.py" region="configurable" />
      </Panel>

      <Panel title="The reply node and graph (harness glue)">
        <SourceCode file="backend/src/graphs/configurable.py" region="reply" />
      </Panel>

      <Panel title="The frontend side" description="Nothing config-related, by design.">
        <SourceCode file="frontend/src/app/configurable/demo-chat/page.tsx" />
      </Panel>

      <Callout tone="info" title="FastAPI transport only">
        <p>
          The page&apos;s Python tab is written for a self-hosted AG-UI
          endpoint. Under the LangSmith transport (<code>langgraph dev</code>)
          there is no request-local agent, so <code>tenant_id</code> is never
          set and the page&apos;s node raises <code>KeyError</code>.
        </p>
      </Callout>
    </>
  );
}
