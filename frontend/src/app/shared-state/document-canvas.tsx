"use client";

/**
 * The live document pane fed by `agent.state.document`.
 *
 * Shared by State Streaming, State Rendering and the Shared State overview,
 * because all three doc pages drive the same `shared-state-streaming` agent and
 * differ only in where they put the output.
 *
 * The one thing worth noticing is the LIVE badge: it is driven by
 * `agent.isRunning`, which is why the subscribing hook asks for
 * `OnRunStatusChanged` as well as `OnStateChanged`. State alone tells you what
 * the document says, not whether more is coming.
 */
export function DocumentCanvas({
  document,
  isRunning,
  title = "Document",
}: {
  document: string;
  isRunning: boolean;
  title?: string;
}) {
  const words = document.trim() ? document.trim().split(/\s+/).length : 0;

  return (
    <div
      data-testid="document-canvas"
      className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h2>
          {isRunning && (
            <span
              data-testid="document-live"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              Live
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-slate-400">{words} words</span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {document.trim() ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-200">
            {document}
          </p>
        ) : (
          <p className="flex h-full items-center justify-center text-center text-sm italic text-slate-400">
            Ask the agent to write something. It fills in here word by word —
            never as a chat message.
          </p>
        )}
      </div>
    </div>
  );
}
