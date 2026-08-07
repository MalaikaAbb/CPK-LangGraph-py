"use client";

export type Preferences = {
  tone: string;
  detail: string;
};

/**
 * Read-side render: this card reflects the agent-authored `notes` slice of
 * shared state. The parent passes `state.notes` in; this component never
 * touches agent state itself — it just renders. The Clear button is a small
 * write-back, exposed as an `onClear` prop so the state mutation stays with
 * the component that owns the subscription.
 */
export function NotesCard({
  notes,
  onClear,
}: {
  notes: string[];
  onClear: () => void;
}) {
  return (
    <div
      data-testid="notes-card"
      className="w-full rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Agent scratch pad
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The agent writes here via its{" "}
            <code className="font-mono text-[11px]">set_notes</code> tool. The
            UI re-renders from shared state.
          </p>
        </div>
        {notes.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            data-testid="notes-clear-button"
            className="shrink-0 rounded-md border border-rose-300 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700 dark:border-rose-800 dark:text-rose-300"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4">
        {notes.length === 0 ? (
          <div
            data-testid="notes-empty"
            className="flex min-h-[140px] items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 text-center text-sm italic text-slate-400 dark:border-slate-700"
          >
            The agent will make observations about you and note them here.
          </div>
        ) : (
          <ul data-testid="notes-list" className="space-y-2 text-sm">
            {notes.map((note, i) => (
              <li
                key={i}
                data-testid="note-item"
                className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60"
              >
                <span className="select-none font-mono text-xs leading-5 text-slate-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-slate-800 dark:text-slate-200">
                  {note}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Write-side: every edit here goes straight into agent state. */
export function PreferencesCard({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
}) {
  const fields: { key: keyof Preferences; label: string; options: string[] }[] = [
    { key: "tone", label: "Tone", options: ["neutral", "playful", "formal"] },
    { key: "detail", label: "Detail", options: ["brief", "normal", "thorough"] },
  ];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Your preferences
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Written with <code className="font-mono text-[11px]">agent.setState</code>
        . A before-model callback reads them back and prepends them to the
        system prompt, so these steer the model rather than just the panel.
      </p>

      <div className="mt-4 space-y-3">
        {fields.map(({ key, label, options }) => (
          <div key={key}>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {options.map((option) => {
                const active = preferences[key] === option;
                return (
                  <button
                    key={option}
                    onClick={() => onChange({ ...preferences, [key]: option })}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      active
                        ? "bg-[var(--accent)] text-white"
                        : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
