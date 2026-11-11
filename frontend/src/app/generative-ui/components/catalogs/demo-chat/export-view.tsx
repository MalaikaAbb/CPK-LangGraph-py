"use client";

import { exportA2UICatalog } from "@copilotkit/react-core/v2/generative-ui";

import { appUI } from "./combine";
import { panelUI } from "./panel-order";

/**
 * "Export the catalog for other A2UI tools". The page's call is verbatim; its
 * next line writes the result with `fs.writeFileSync`, which a browser cannot
 * do, so this view prints the same object instead (harness glue).
 *
 * The second block is "Positional parameter order"'s check: the page says the
 * export lists `Panel.properties` as component, title, children, color.
 */
export function ExportView() {
  const catalog = exportA2UICatalog(appUI, { title: "Acme app" });

  const panel = exportA2UICatalog(panelUI);
  const panelEntry = panel.components.Panel as { properties?: Record<string, unknown> };
  const order = Object.keys(panelEntry?.properties ?? {});

  return (
    <div className="space-y-4 text-xs">
      <div>
        <p className="font-semibold">exportA2UICatalog(panelUI) → Panel.properties order</p>
        <p className="font-mono">{order.join(", ") || "(no properties)"}</p>
        <p className="text-slate-500">Expected by the page: component, title, children, color</p>
      </div>
      <div>
        <p className="font-semibold">
          exportA2UICatalog(appUI, {"{"} title: &quot;Acme app&quot; {"}"}) —{" "}
          {Object.keys(catalog.components).length} components
        </p>
        <pre className="mt-1 max-h-[60vh] overflow-auto rounded bg-slate-100 p-2 dark:bg-slate-900">
          {JSON.stringify(catalog, null, 2)}
        </pre>
      </div>
    </div>
  );
}
