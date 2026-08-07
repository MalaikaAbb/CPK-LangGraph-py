"use client";

/**
 * ⚠ SELF-DEFINED — not from the CopilotKit docs.
 *
 * shadcn-shaped card primitives, rebuilt from how `time-picker-card.tsx` uses
 * them. Same names and prop shapes as shadcn/ui so the card reads the way the
 * ecosystem expects, but Tailwind-only — no `cn()`/`cva` dependency and no
 * shadcn CLI install.
 */

import type { HTMLAttributes } from "react";

/** Tiny class joiner. Enough for these components; not a `cn()` replacement. */
const cx = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" ");

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        "rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow-sm",
        "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cx("flex flex-col space-y-1.5 p-4", className)} {...props} />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cx(
        "text-base font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cx(
        "text-sm text-neutral-500 dark:text-slate-400",
        className,
      )}
      {...props}
    />
  );
}

export function CardContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("p-4 pt-0", className)} {...props} />;
}
