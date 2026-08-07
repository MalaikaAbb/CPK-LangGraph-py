"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";
import { useState } from "react";
import type { SyntheticEvent } from "react";

import { DemoFrame } from "@/components/demo-frame";

/**
 * The doc's attachments configuration, with both error paths wired.
 *
 * `attachments={{ enabled: true }}` is genuinely all it takes; everything else
 * here is the page's optional configuration, included so the failure modes are
 * observable rather than theoretical:
 *
 *  - `accept` / `maxSize` reject a file before it is ever sent, firing
 *    `onUploadFailed` with `invalid-type` or `file-too-large`.
 *  - `onError` catches what happens *after* send — notably a model that cannot
 *    take the modality you gave it, which arrives as a RUN_ERROR.
 */
type Rejection = { reason: string; message: string };

export default function Page() {
  const [rejections, setRejections] = useState<Rejection[]>([]);
  const [runError, setRunError] = useState<string | null>(null);

  return (
    <DemoFrame
      parentPath="/multimodal-attachments"
      subtitle="graph: multimodal"
    >
      <div className="flex h-full flex-col">
        {(rejections.length > 0 || runError) && (
          <div className="shrink-0 space-y-1 border-b border-amber-300 bg-amber-50 px-4 py-2 dark:border-amber-900 dark:bg-amber-950/40">
            {rejections.map((r, i) => (
              <p
                key={i}
                className="text-xs text-amber-900 dark:text-amber-100"
              >
                <code className="font-mono font-semibold">{r.reason}</code> —{" "}
                {r.message}
              </p>
            ))}
            {runError && (
              <p className="text-xs text-rose-800 dark:text-rose-200">
                <code className="font-mono font-semibold">run error</code> —{" "}
                {runError}
              </p>
            )}
          </div>
        )}

        <div className="min-h-0 flex-1">
          <CopilotChat
            agentId="multimodal"
            className="h-full"
            attachments={{
              enabled: true,
              // Omit `accept` to allow all file types (default "*/*"). Narrowed
              // here so the rejection path is easy to trigger with a .zip.
              accept: "image/*,audio/*,video/*,application/pdf",
              maxSize: 10 * 1024 * 1024, // 10MB (default is 20MB)
              
            }}
          />
        </div>
      </div>
    </DemoFrame>
  );
}
