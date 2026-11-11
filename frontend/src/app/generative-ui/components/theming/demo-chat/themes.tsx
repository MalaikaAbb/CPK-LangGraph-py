"use client";

// The page's `theme` samples. The first is the whole `generativeUI` value of
// the page's provider; the others are printed as bare `theme: { ... }`
// fragments, so `ui: standardUI` around them is harness glue (the page uses
// standardUI throughout). The `theme` values themselves are verbatim.
import {
  standardUI,
  type GenerativeUIConfig,
} from "@copilotkit/react-core/v2/generative-ui";

import { theme } from "./theme";

/** "What is this?" — the provider's generativeUI prop. */
export const brandTheme: GenerativeUIConfig = {
  ui: standardUI,
  theme: {
    "--a2ui-color-accent": "#d97706",
    "--a2ui-font-family": "Inter, sans-serif",
    "--a2ui-radius-md": "10px",
  },
};

/** "The variables" — the typed theme file. */
export const fileTheme: GenerativeUIConfig = { ui: standardUI, theme };

/** "Colors for each mode". */
export const perModeTheme: GenerativeUIConfig = {
  ui: standardUI,
  theme: {
    "--a2ui-color-accent": "#d97706",
    dark: {
      "--a2ui-color-panel": "#1f2937",
      "--a2ui-color-surface": "#111827",
    },
  },
};

/** "The map" — the page's example URLs, which do not serve a style. */
export const mapTheme: GenerativeUIConfig = {
  ui: standardUI,
  theme: {
    mapStyle: "https://tiles.example.com/light.json",
    dark: { mapStyle: "https://tiles.example.com/dark.json" },
  },
};

/** "Set variables in CSS" — no `theme`; `theming.css` sets the accent. */
export const cssTheme: GenerativeUIConfig = { ui: standardUI };
