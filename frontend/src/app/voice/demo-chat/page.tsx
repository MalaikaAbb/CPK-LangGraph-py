"use client";

import { CopilotChat, CopilotKit } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";
import { nestedInspectorSetting } from "@/lib/inspector";

import { SampleAudioButton } from "../sample-audio-button";

const SAMPLE_TEXT = "What is the weather in Tokyo?";

/**
 * The doc's `voice` cell.
 *
 * This is one of three routes that mounts its own `<CopilotKit>` rather than
 * using the app-wide provider, and the reason is structural: voice needs the
 * **v2** runtime (only it carries `transcriptionService`), which lives at a
 * different endpoint. `runtimeUrl` therefore points at
 * `/api/copilotkit-voice`, and `useSingleEndpoint={false}` lets the v2 handler
 * own its sub-routing.
 *
 * `enableInspector` is passed explicitly because two inspectors on one page is
 * fatal — see `lib/inspector.ts`. The root provider stands down on this route
 * so this one can own it.
 *
 * Nothing about `<CopilotChat>` mentions voice. The mic button appears purely
 * because the runtime advertises `audioFileTranscriptionEnabled: true` on
 * `/info`.
 */
export default function Page() {
  return (
    <DemoFrame parentPath="/voice" subtitle="graph: voice-demo · v2 runtime">
      <CopilotKit
        runtimeUrl="/api/copilotkit-voice"
        agent="voice-demo"
        useSingleEndpoint={false}
        enableInspector={nestedInspectorSetting}
      >
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
            <SampleAudioButton sampleText={SAMPLE_TEXT} />
            <span className="text-xs text-slate-500">
              No microphone needed — this inserts the phrase directly.
            </span>
          </div>
          <div className="min-h-0 flex-1">
            <CopilotChat agentId="voice-demo" className="h-full" />
          </div>
        </div>
      </CopilotKit>
    </DemoFrame>
  );
}
