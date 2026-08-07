import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/voice" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Live speech-to-text in the composer. The notable thing is how little
          of it is frontend: <code>&lt;CopilotChat&gt;</code> grows a mic button
          on its own, purely because the runtime it is talking to advertises{" "}
          <code>audioFileTranscriptionEnabled: true</code> on its{" "}
          <code>/info</code> endpoint. All the work is in wiring a{" "}
          <code>TranscriptionService</code> into a v2 runtime.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={["Press the 🎙 sample-audio button, then send"]}
            expect="Text lands in the composer and the agent answers in short spoken-length prose. With OPENAI_API_KEY set, the mic button also records and transcribes."
            fail="No mic button at all — the runtime has no transcription service, or basePath does not match the route directory. Those are the only two causes."
          />
        </div>
      </Panel>

      <Panel title="Why this route needs its own runtime">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>transcriptionService</code> is a v2 runtime option and the v1
          wrapper that <code>/api/copilotkit</code> uses drops it silently. So
          voice gets a second endpoint built with{" "}
          <code>createCopilotRuntimeHandler</code> from{" "}
          <code>@copilotkit/runtime/v2</code>. Two details there are easy to get
          wrong and both fail the same quiet way — no mic button:
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-400">
          <li>
            The route file must be a catch-all (
            <code>[[...slug]]/route.ts</code>), because the v2 handler does its
            own sub-routing for <code>/info</code>, <code>/transcribe</code> and{" "}
            <code>/agent/:id/run</code>.
          </li>
          <li>
            <code>basePath</code> must equal the route&apos;s directory path, or
            that sub-routing resolves against the wrong prefix.
          </li>
        </ul>
      </Panel>

      <Panel title="The runtime">
        <SourceCode file="frontend/src/app/api/copilotkit-voice/[[...slug]]/route.ts" />
      </Panel>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/voice/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Driving it without a microphone">
        <SourceCode file="frontend/src/app/voice/sample-audio-button.tsx" />
      </Panel>

      <Callout tone="warn" title="Transcription is OpenAI Whisper, not your graph's model">
        <p>
          This is the one place in the repo where the key lives on the{" "}
          <em>frontend</em> process rather than the Python one, and it is a
          separate call from anything the agent does. Without{" "}
          <code>OPENAI_API_KEY</code> in <code>frontend/.env.local</code>, the
          mic returns a clean 401 — the guarded service in the runtime above
          exists to make that a typed auth error rather than an opaque 500. The
          sample-audio button bypasses transcription entirely, which is why this
          route is still testable without the key.
        </p>
      </Callout>

      <Callout tone="info" title="One change from the printed runtime">
        <p>
          The doc&apos;s version hardcodes{" "}
          <code>
            new LangGraphAgent({"{ deploymentUrl, graphId: 'sample_agent' }"})
          </code>
          , which pins it to the LangSmith transport. This repo routes it through{" "}
          <code>buildAgents()</code> instead so the voice endpoint honours the
          same FastAPI/LangSmith switch as every other route.
        </p>
      </Callout>
    </>
  );
}
