import type { NextRequest } from "next/server";
import {
  CopilotRuntime,
  TranscriptionService,
  createCopilotRuntimeHandler,
} from "@copilotkit/runtime/v2";
import type { TranscribeFileOptions } from "@copilotkit/runtime/v2";
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import OpenAI from "openai";

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
 */

/**
 * Transcription service wrapper that reports a clean, typed auth error when
 * OPENAI_API_KEY is not configured. When the key is present we delegate to
 * the real OpenAI-backed service; any upstream Whisper error keeps its
 * natural categorization.
 *
 * `baseURL` is pinned to real OpenAI (or `OPENAI_TRANSCRIPTION_BASE_URL` when
 * explicitly set) rather than inheriting `OPENAI_BASE_URL`, so pointing the
 * chat model at a proxy never silently reroutes real microphone audio.
 */
class GuardedOpenAITranscriptionService extends TranscriptionService {
  private delegate: TranscriptionServiceOpenAI | null;

  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL =
      process.env.OPENAI_TRANSCRIPTION_BASE_URL ?? "https://api.openai.com/v1";
    this.delegate = apiKey
      ? new TranscriptionServiceOpenAI({
          openai: new OpenAI({ apiKey, baseURL }),
        })
      : null;
  }

  async transcribeFile(options: TranscribeFileOptions): Promise<string> {
    if (!this.delegate) {
      // "api key" substring → handleTranscribe maps to AUTH_FAILED → 401.
      throw new Error(
        "OPENAI_API_KEY not configured for this deployment (api key missing). " +
          "Set OPENAI_API_KEY to enable voice transcription.",
      );
    }
    return this.delegate.transcribeFile(options);
  }
}

// Cache the runtime + handler across invocations so the transcription service
// is constructed once per Node process instead of per request.
let cachedHandler: ((req: Request) => Promise<Response>) | null = null;

function getHandler(): (req: Request) => Promise<Response> {
  if (cachedHandler) return cachedHandler;

  const runtime = new CopilotRuntime({
    agents: buildAgents([
      // The page mounts <CopilotKit agent="voice-demo">.
      "voice-demo",
    ]),
    transcriptionService: new GuardedOpenAITranscriptionService(),
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
