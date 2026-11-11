"use client";

import {
  CopilotChat,
  useConfigureSuggestions,
  useDefaultRenderTool,
  useRenderTool,
} from "@copilotkit/react-core/v2";
import { z } from "zod";

import { DemoFrame } from "@/components/demo-frame";

import { WeatherCard } from "../weather-card";

/**
 * The doc's `tool-rendering` cell, narrowed to the one tool the docs define.
 *
 * Two renderers, which is the composition the page is really about:
 *
 *  1. A named renderer for `get_weather`. `name` must equal the tool name the
 *     agent exposes exactly — that string is how the runtime routes the call.
 *  2. `useDefaultRenderTool` as the `*` wildcard. Without it the runtime has no
 *     catch-all and unmatched tool calls are invisible; you only see the
 *     assistant's final text.
 *
 * The backend now exposes all four tools from the page's demo Code tab
 * (`search_flights`, `get_stock_price` and `roll_d20` besides `get_weather`).
 * Only `get_weather` has a named renderer here; the other three are painted by
 * the wildcard below. The Code tab's own per-tool cards for them (and its
 * retry view) are not ported — see README §9 item 13.
 */
interface WeatherResult {
  city?: string;
  temperature?: number;
  humidity?: number;
  wind_speed?: number;
  conditions?: string;
}

/** Tool results arrive as a JSON string; the page factors this out too. */
function parseJsonResult<T>(result: unknown): Partial<T> {
  if (!result) return {};
  if (typeof result === "object") return result as Partial<T>;
  if (typeof result === "string") {
    try {
      return JSON.parse(result) as Partial<T>;
    } catch {
      return {};
    }
  }
  return {};
}

export default function Page() {
  return (
    <DemoFrame
      parentPath="/generative-ui/tool-rendering"
      subtitle="graph: tool-rendering"
    >
      <Chat />
    </DemoFrame>
  );
}

function Chat() {
  // Per-tool renderer: get_weather → branded WeatherCard.
  useRenderTool(
    {
      name: "get_weather",
      parameters: z.object({
        location: z.string(),
      }),
      render: ({ parameters, result, status }) => {
        const loading = status !== "complete";
        const parsed = parseJsonResult<WeatherResult>(result);
        return (
          <WeatherCard
            loading={loading}
            location={parameters?.location ?? parsed.city ?? ""}
            temperature={parsed.temperature}
            humidity={parsed.humidity}
            windSpeed={parsed.wind_speed}
            conditions={parsed.conditions}
          />
        );
      },
    },
    [],
  );

  // Wildcard catch-all for anything a named renderer did not claim. With the
  // package's built-in DefaultToolCallRenderer, since calling it with no
  // config is the zero-config entry point the page leads with.
  useDefaultRenderTool();

  useConfigureSuggestions({
    suggestions: [
      { title: "Weather in Tokyo", message: "What's the weather in Tokyo?" },
      {
        title: "Compare two cities",
        message: "Compare the weather in Reykjavik and Cairo.",
      },
    ],
    available: "always",
  });

  return <CopilotChat agentId="tool-rendering" className="h-full" />;
}
