import type { NextRequest } from "next/server";
import { createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

import { createTranscriptionService } from "@/lib/transcription-service";
import { buildRuntime } from "@/lib/copilot-runtime";
import { buildAgents } from "@/lib/runtime-agents";

/**
 * The Voice runtime, reproduced from the doc page.
 *
 * Why this exists as a second endpoint at all: `transcriptionService` is a **v2
 * runtime** option, and the v1 wrapper the main `/api/copilotkit` route uses
 * drops it. So voice needs `createCopilotRuntimeHandler` from
 * `@copilotkit/runtime/v2` directly.
 *
 * The `[[...slug]]` catch-all is not decorative either: the v2 handler does its
 * own sub-routing (`/info`, `/transcribe`, `/agent/:id/run`), so every sub-path
 * has to reach it. `basePath` must equal this file's directory or that routing
 * resolves against the wrong prefix.
 *
 * With a transcription service set, `/info` advertises
 * `audioFileTranscriptionEnabled: true`, which is the single fact that makes
 * `<CopilotChat>` render a mic button. No mic button means one of those two
 * halves is wrong.
 *
 * One change from the printed version: the page hardcodes
 * `new LangGraphAgent({ deploymentUrl, graphId: "sample_agent" })`. This repo
 * routes it through `buildAgents` instead so the voice endpoint honours the
 * same FastAPI/LangSmith transport switch as everything else.
 *
 * Since the 2026-11 revision the page no longer wraps the service in a guard
 * class that throws a 401 without a key. `createTranscriptionService()` (in
 * `lib/transcription-service.ts`, as the page lays it out) returns
 * `undefined` without `OPENAI_TRANSCRIPTION_API_KEY`, the mic button is
 * hidden, and a direct `POST /transcribe` answers 503
 * `service_not_configured`.
 */

// Cache the runtime + handler across invocations so the transcription service
// is constructed once per Node process instead of per request. A missing
// OPENAI_TRANSCRIPTION_API_KEY leaves the service undefined (transcription
// disabled), so construction is safe at first request.
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;

function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  // Shares `buildRuntime`, so Intelligence and per-user threads work here too;
  // `transcriptionService` is the one option unique to this endpoint.
  const runtime = buildRuntime({
    agents: buildAgents([
      // The page mounts <CopilotKit agent="voice-demo">.
      "voice-demo",
    ]),
    transcriptionService: createTranscriptionService(),
  });

  cachedHandler = createCopilotRuntimeHandler({
    runtime,
    basePath: "/api/copilotkit-voice",
  });
  return cachedHandler;
}

// Next.js App Router bindings. The catch-all slug forwards every sub-path
// (`/info`, `/agent/:id/run`, `/transcribe`, …) to the v2 handler so its URL
// router can dispatch.
export const POST = (req: NextRequest) => getHandler()(req);
export const GET = (req: NextRequest) => getHandler()(req);
export const PUT = (req: NextRequest) => getHandler()(req);
export const DELETE = (req: NextRequest) => getHandler()(req);
