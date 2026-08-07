"use client";

/**
 * ⚠ SELF-DEFINED — not from the CopilotKit docs.
 *
 * shadcn-shaped badge, rebuilt from how `time-picker-card.tsx` uses it. The
 * three variants it needs — `outline` while the card is waiting, `success`
 * once a slot is picked, `destructive` on cancel — are what tell the user at a
 * glance whether the agent is still blocked on them.
 */

import type { HTMLAttributes } from "react";

const cx = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" ");

type Variant = "default" | "outline" | "success" | "destructive";

const VARIANTS: Record<Variant, string> = {
  default:
    "border-transparent bg-neutral-900 text-white dark:bg-slate-100 dark:text-slate-900",
  outline:
    "border-neutral-300 text-neutral-700 dark:border-slate-600 dark:text-slate-300",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200",
  destructive:
    "border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-200",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        VARIANTS[variant],
        className,
      )}
      {...props}
    />
  );
}
