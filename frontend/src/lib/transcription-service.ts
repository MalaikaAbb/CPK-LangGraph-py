// Verbatim from the Voice page's "Custom transcription backends" section
// (https://docs.copilotkit.ai/langgraph-python/voice, 2026-11 revision): build
// the service only when its dedicated credential is set, otherwise return
// undefined so the runtime reports transcription as disabled.
// src/lib/transcription-service.ts
import { TranscriptionServiceOpenAI } from "@copilotkit/voice";
import { OpenAI } from "openai";

const OPENAI_TRANSCRIPTION_URL = "https://api.openai.com/v1";

export function createTranscriptionService(
  env: NodeJS.ProcessEnv = process.env,
): TranscriptionServiceOpenAI | undefined {
  const apiKey = env.OPENAI_TRANSCRIPTION_API_KEY;
  if (!apiKey) return undefined;

  return new TranscriptionServiceOpenAI({
    openai: new OpenAI({
      apiKey,
      baseURL: env.OPENAI_TRANSCRIPTION_BASE_URL ?? OPENAI_TRANSCRIPTION_URL,
    }),
  });
}
