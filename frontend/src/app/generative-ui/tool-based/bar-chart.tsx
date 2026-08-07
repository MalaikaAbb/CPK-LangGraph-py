"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { z } from "zod";

/**
 * The component the agent renders by calling `render_bar_chart`.
 *
 * It knows nothing about CopilotKit — it reads its props and draws. That is
 * the whole idea of tool-based generative UI: the component is the tool, so
 * there is no handler, no user interaction, and nothing running server-side.
 *
 * The schema doubles as the tool's parameter definition, so the LLM's
 * arguments are validated against it before they ever reach this component.
 */
export const barChartPropsSchema = z.object({
  title: z.string().describe("Chart heading, e.g. 'Monthly signups'"),
  data: z
    .array(
      z.object({
        label: z.string().describe("Category or time bucket"),
        value: z.number().describe("Numeric value for this label"),
      }),
    )
    .describe("The bars, in the order they should appear"),
});

export type BarChartProps = z.infer<typeof barChartPropsSchema>;

export function BarChart({ title, data }: BarChartProps) {
  const bars = Array.isArray(data) ? data : [];

  return (
    <div
      data-testid="gen-ui-bar-chart"
      className="my-2 w-full rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </p>
      {bars.length === 0 ? (
        // The chart streams in as the agent fills the payload, so an empty
        // array is a normal intermediate state, not an error.
        <p className="py-8 text-center text-sm text-slate-400">Loading data…</p>
      ) : (
        <div className="mt-3 h-52 w-full">
          <ResponsiveContainer>
            <RechartsBarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip />
              <Bar dataKey="value" fill="#4285f4" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
