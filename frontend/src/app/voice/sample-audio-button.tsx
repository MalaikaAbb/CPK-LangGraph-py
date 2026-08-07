"use client";

/**
 * The doc's escape hatch for driving the voice route without a microphone.
 *
 * Useful for screenshots, for Playwright, and for anyone who would rather not
 * be prompted for microphone permission. It skips the `/transcribe` endpoint
 * entirely and puts text straight into the composer, so it works whether or not
 * `OPENAI_API_KEY` is set — which is what keeps this route testable without one.
 *
 * The page describes exactly this ("ship a button that emits a canned sample
 * phrase through an `onTranscribed` callback, bypassing the transcription
 * endpoint entirely") and prints the button, but not the insertion mechanics
 * below — it only notes that the parent "can then drop that text into the
 * composer's textarea using the native value setter and a synthetic `input`
 * event". That is what this implements.
 *
 * The composer is a controlled React textarea, so assigning `.value` directly
 * would be silently reverted on the next render. The native value setter plus
 * a dispatched `input` event is what React's synthetic event system actually
 * listens for.
 */
export function SampleAudioButton({ sampleText }: { sampleText: string }) {
  const insert = () => {
    const textarea = document.querySelector<HTMLTextAreaElement>(
      '[data-testid="copilot-chat-textarea"]',
    );
    if (!textarea) {
      console.warn("[voice] composer textarea not found");
      return;
    }

    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;
    setter?.call(textarea, sampleText);
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    textarea.focus();
  };

  return (
    <button
      type="button"
      data-testid="voice-sample-audio-button"
      onClick={insert}
      title={`Inserts: "${sampleText}"`}
      className="inline-flex w-fit items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:border-white/10 dark:bg-black/30 dark:hover:bg-white/10"
    >
      <span aria-hidden>🎙</span>
      <span>Try a sample audio</span>
    </button>
  );
}
