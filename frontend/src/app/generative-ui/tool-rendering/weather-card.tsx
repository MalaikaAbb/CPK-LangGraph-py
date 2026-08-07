"use client";

/**
 * The card drawn in place of the raw `get_weather` tool call.
 *
 * It renders in both states, which is the point: while `loading` is true the
 * arguments are already known (the location the model asked about) but the
 * result is not, so the card can show what is being fetched rather than a bare
 * spinner.
 */
export function WeatherCard({
  loading,
  location,
  temperature,
  humidity,
  windSpeed,
  conditions,
}: {
  loading: boolean;
  location: string;
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  conditions?: string;
}) {
  return (
    <div
      data-testid="weather-card"
      className="my-2 w-full max-w-sm rounded-xl border border-sky-200 bg-gradient-to-b from-sky-50 to-white p-4 dark:border-sky-900 dark:from-sky-950/50 dark:to-slate-900"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {location || "…"}
        </p>
        <span className="rounded-full border border-sky-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-sky-700 dark:border-sky-700 dark:text-sky-300">
          {loading ? "Calling weather API…" : "get_weather"}
        </span>
      </div>

      {loading ? (
        <p className="mt-3 animate-pulse text-sm text-slate-500">
          Fetching conditions…
        </p>
      ) : (
        <>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
            {temperature ?? "—"}°
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {conditions ?? "Unknown"}
          </p>
          <dl className="mt-3 flex gap-6 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <dt className="uppercase tracking-wide text-slate-400">Humidity</dt>
              <dd className="tabular-nums">{humidity ?? "—"}%</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wide text-slate-400">Wind</dt>
              <dd className="tabular-nums">{windSpeed ?? "—"} mph</dd>
            </div>
          </dl>
        </>
      )}
    </div>
  );
}

/**
 * The wildcard renderer: every tool call that no named renderer claimed.
 *
 * Nothing on this route's agent reaches it — `get_weather` is the only backend
 * tool the doc defines — but it stays wired because that is the composition
 * the page teaches, and because it is what would catch a newly added tool
 * before anyone writes UI for it.
 */
export function CustomCatchallRenderer({
  name,
  parameters,
  status,
  result,
}: {
  name: string;
  parameters?: unknown;
  status: string;
  result?: unknown;
}) {
  const done = status === "complete";

  return (
    <div
      data-testid="catchall-tool-card"
      className="my-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60"
    >
      <div className="flex items-center gap-2">
        <code className="font-semibold text-slate-900 dark:text-slate-100">
          {name}
        </code>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
            done
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
          }`}
        >
          {done ? "Done" : "Running"}
        </span>
        <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400">
          catch-all
        </span>
      </div>

      <details className="mt-2">
        <summary className="cursor-pointer text-slate-500">Arguments</summary>
        <pre className="mt-1 overflow-x-auto text-[11px] text-slate-700 dark:text-slate-300">
          {JSON.stringify(parameters ?? {}, null, 2)}
        </pre>
      </details>

      {done && (
        <details className="mt-1">
          <summary className="cursor-pointer text-slate-500">Result</summary>
          <pre className="mt-1 overflow-x-auto text-[11px] text-slate-700 dark:text-slate-300">
            {typeof result === "string" ? result : JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Tool results arrive as a JSON string on the wire, so every renderer that
 * wants fields out of one has to parse defensively — a half-streamed result is
 * not yet valid JSON.
 */
export function parseJsonResult<T>(result: unknown): Partial<T> {
  if (!result) return {};
  if (typeof result === "object") return result as Partial<T>;
  if (typeof result !== "string") return {};
  try {
    const parsed = JSON.parse(result);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}
