"use client";

/**
 * The surface `change_background` repaints.
 *
 * The doc page imports `Background` and `DEFAULT_BACKGROUND` from a sibling
 * `./background` but never prints either, so both are this repo's. See
 * README §9.
 *
 * It renders the live CSS value under the heading on purpose: the whole test
 * for this route is whether a value the *model* produced reached React state,
 * and a gradient alone does not prove which value arrived.
 */
export const DEFAULT_BACKGROUND =
  "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)";

export function Background({
  background,
  children,
}: {
  background: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      data-testid="frontend-tools-background"
      className="h-full overflow-y-auto p-8 transition-[background] duration-500"
      style={{ background }}
    >
      <div className="mx-auto max-w-xl rounded-2xl bg-white/80 p-6 shadow-sm backdrop-blur dark:bg-slate-900/80">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Frontend tools - Theme
        </h2>
        

        <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
          Current CSS value
        </p>
        <code
          data-testid="frontend-tools-css-value"
          className="mt-1 block break-all rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs text-slate-100"
        >
          {background}
        </code>

        {children}
      </div>
    </div>
  );
}
