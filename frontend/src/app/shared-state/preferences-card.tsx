"use client";

import type { Preferences } from "./notes-card";

/**
 * Write-side render: the UI-owned half of shared state.
 *
 * Every change here goes straight into `agent.setState`, and
 * `PreferencesInjectorMiddleware` reads it back out on the agent's next turn
 * and adds it to the system prompt. That round trip is what makes the panel a
 * steering wheel rather than a display — the pass criterion for the route is
 * that the *next reply* visibly changes register.
 */
const TONES = ["neutral", "playful", "formal"] as const;
const DETAIL = ["brief", "normal", "thorough"] as const;

export function PreferencesCard({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (next: Preferences) => void;
}) {
  return (
    <div
      data-testid="preferences-card"
      className="w-full rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Your preferences
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Written with <code className="font-mono text-xs">agent.setState</code>.
        The agent reads them at the start of every turn.
      </p>

      <div className="mt-4 space-y-4">
        <Row
          label="Tone"
          options={TONES}
          value={preferences.tone}
          onSelect={(tone) => onChange({ ...preferences, tone })}
        />
        <Row
          label="Detail"
          options={DETAIL}
          value={preferences.detail}
          onSelect={(detail) => onChange({ ...preferences, detail })}
        />
      </div>
    </div>
  );
}

function Row({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            data-testid={`pref-${label.toLowerCase()}-${option}`}
            onClick={() => onSelect(option)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              value === option
                ? "bg-[var(--accent)] text-white"
                : "border border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
