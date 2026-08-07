"use client";

/**
 * ⚠ SELF-DEFINED — not from the CopilotKit docs.
 *
 * shadcn-shaped button, rebuilt from how `time-picker-card.tsx` uses it:
 * `variant` (outline / ghost), `size` (sm), plus the usual button attributes.
 *
 * The `disabled` styling matters here rather than being decoration — this
 * button is the only thing standing between a user and double-resolving a
 * human-in-the-loop tool call, so a disabled slot has to *look* unavailable.
 */

import type { ButtonHTMLAttributes } from "react";

const cx = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" ");

type Variant = "default" | "outline" | "ghost" | "destructive";
type Size = "default" | "sm";

const VARIANTS: Record<Variant, string> = {
  default:
    "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200",
  outline:
    "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost:
    "text-neutral-700 hover:bg-neutral-100 dark:text-slate-300 dark:hover:bg-slate-800",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const SIZES: Record<Size, string> = {
  default: "h-9 px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "default",
  size = "default",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
