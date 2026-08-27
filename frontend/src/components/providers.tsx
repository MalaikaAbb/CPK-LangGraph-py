"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

/**
 * One provider for the whole app, so a conversation survives navigation
 * between test routes.
 *
 * Three routes mount a second, nested `<CopilotKit>` of their own rather than
 * using this one — Voice (different runtime, because transcription only exists
 * on the v2 runtime) and the two A2UI routes (each needs its own catalog, and
 * dynamic-schema needs the runtime that still injects the A2UI tool). Those
 * are the cases where the doc page is specifically about the provider, so an
 * isolated instance is the honest thing to show.
 *
 * On the inspector prop name, which is genuinely confusing: the doc page says
 * `enableInspector`, and that prop exists — but only on `<CopilotKit>`, the v1
 * compatibility wrapper. All it does there is forward to this provider's
 * `showDevConsole`. On `CopilotKitProvider` there is no `enableInspector` at
 * all, and `showDevConsole` is the only switch. See README §9.
 *
 * Two props exist for Rich Threads:
 *
 * `headers` carries the identity `identifyUser` reads on the runtime. Threads
 * are per-user, so without it every visitor of a deployed copy would share one
 * history. A real app derives this from a verified session; a local harness has
 * none, so it sends a fixed demo identity you can override with
 * NEXT_PUBLIC_DEMO_USER_ID to watch two thread lists diverge.
 *
 * `publicLicenseKey` is the client-side half of the license axis and what the
 * Threads Drawer doc's own sample passes; the server-side half is
 * `licenseToken` on the runtime. Either unlocks the drawer's real UI. With
 * neither, the drawer renders its locked "Upgrade" view even when threads are
 * working, because it gates on the reported license status rather than on
 * whether thread endpoints respond. It is genuinely public — unlike
 * INTELLIGENCE_API_KEY, which must never be prefixed NEXT_PUBLIC_.
 */

const RUNTIME_URL = "/api/copilotkit";

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "harness-local";
const DEMO_USER_NAME = process.env.NEXT_PUBLIC_DEMO_USER_NAME ?? "Harness User";
const PUBLIC_LICENSE_KEY =
  process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY;

export function Providers({ children }: { children: ReactNode }) {
  // The inspector can only watch the core it is attached to, and two of them
  // on one page is fatal — so on routes that bring their own provider, this
  // one yields. `lib/inspector.ts` owns that decision.
  const pathname = usePathname();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      headers={{
        "x-user-id": DEMO_USER_ID,
        "x-user-name": DEMO_USER_NAME,
      }}
      // Spread rather than passed as `publicLicenseKey={undefined}`: an
      // explicit undefined is still a supplied prop, and the provider treats a
      // present-but-empty key differently from an absent one.
      {...(PUBLIC_LICENSE_KEY ? { publicLicenseKey: PUBLIC_LICENSE_KEY } : {})}
      showDevConsole={rootInspectorSetting(pathname)}
      // Bottom-left, because the prebuilt Popup and Sidebar launchers both
      // live bottom-right and would sit under the inspector button.
      inspectorDefaultAnchor={{ horizontal: "left", vertical: "bottom" }}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {children}
    </CopilotKitProvider>
  );
}
