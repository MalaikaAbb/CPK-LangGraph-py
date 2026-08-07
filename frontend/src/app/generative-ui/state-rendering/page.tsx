import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/generative-ui/state-rendering" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Building UI that reflects agent state in real time — progress, drafts,
          intermediate results — rather than waiting for a final message. The
          agent&apos;s output <em>is</em> the application here; the chat is
          incidental, docked off to one side.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Write a short blog post about shipping agents to production."]}
            expect="The main pane fills progressively with a LIVE badge while the sidebar shows only a brief tool call. The prose never appears as a chat message."
            fail="The text arrives as a chat bubble instead. The agent answered directly rather than calling write_document."
          />
        </div>
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/generative-ui/state-rendering/demo-chat/page.tsx" />
      </Panel>

      <Panel title="The backend">
        <SourceCode
          file="backend/src/graphs/shared_state_streaming.py"
          region="agent"
        />
      </Panel>

      <Callout tone="info" title="Same agent as State Streaming, deliberately">
        <p>
          The docs point both pages at one demo agent, and this repo keeps that.
          The mechanism is not what differs between them — it is the same{" "}
          <code>StateStreamingMiddleware</code> mapping either way. What differs
          is where the state is rendered:{" "}
          <a
            href="/shared-state/streaming"
            className="text-[var(--accent)] underline underline-offset-4"
          >
            State Streaming
          </a>{" "}
          teaches the mapping, this route makes the case that{" "}
          <code>useAgent</code> is not a chat hook. It works anywhere under the
          provider, so agent state can drive a canvas, a dashboard, or a map
          with no chat surface in sight.
        </p>
      </Callout>

      <Callout tone="info" title="Treat streaming state as partial">
        <p>
          Mid-run, <code>agent.state</code> holds whatever has arrived so far —
          half-written strings, arrays still filling. Guard with defaults, as the
          demo does with <code>?? &quot;&quot;</code>, so a half-streamed value
          cannot crash the render. If a heavy canvas re-renders too often,{" "}
          <code>useAgent({"{ throttleMs }"})</code> is the documented lever.
        </p>
      </Callout>
    </>
  );
}
