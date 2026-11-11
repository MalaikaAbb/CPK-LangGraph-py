"use client";

// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

import { DemoFrame } from "@/components/demo-frame";

import { GenUIDemo } from "../../_shared/genui-demo";
import { ColorSchemeScript, DarkToggle } from "./dark-mode";
import { brandTheme, cssTheme, fileTheme, mapTheme, perModeTheme } from "./themes";
import "./theming.css";

const WELCOME = "Try: show a card with a primary button, a slider, and a bar chart of three months.";

export default function DemoPage() {
  const controls = (
    <div className="space-y-2 text-xs text-slate-500">
      <DarkToggle />
      <p>
        Dark mode follows a <code>dark</code> class on an ancestor. The page&apos;s
        script sets it from the OS setting on load; the toggle flips it by hand.
      </p>
    </div>
  );

  return (
    <DemoFrame parentPath="/generative-ui/components/theming" subtitle="generativeUI.theme">
      <ColorSchemeScript />
      <GenUIDemo
        variants={[
          { id: "brand", label: "Provider theme", generativeUI: brandTheme, page: controls, welcome: WELCOME },
          { id: "file", label: "GenerativeUITheme file", generativeUI: fileTheme, page: controls, welcome: WELCOME },
          { id: "per-mode", label: "Colors per mode", generativeUI: perModeTheme, page: controls, welcome: WELCOME },
          {
            id: "map",
            label: "Map style",
            note: "The page's mapStyle URLs are placeholders on tiles.example.com.",
            generativeUI: mapTheme,
            page: controls,
            welcome: "Try: show the Eiffel Tower on a map.",
          },
          { id: "css", label: "CSS variables", generativeUI: cssTheme, page: controls, welcome: WELCOME },
        ]}
      />
    </DemoFrame>
  );
}
