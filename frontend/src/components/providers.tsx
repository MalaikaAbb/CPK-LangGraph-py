"use client";

import { CopilotKitProvider } from "@copilotkit/react-core/v2";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { rootInspectorSetting } from "@/lib/inspector";

import { RestOnlyThreadStores } from "./rest-only-thread-stores";

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
 * On the inspector prop name, which is a genuine trap: this must be
 * `enableInspector`, not `showDevConsole`. `CopilotKitProviderProps` declares
 * BOTH, so `showDevConsole` typechecks and looks right — but the v2
 * `CopilotKitProvider` never destructures it. The only gate it reads is
 * `shouldEnableInspector`, which mounts the inspector in dev unless
 * `enableInspector` is explicitly `false`. Passing `showDevConsole` is
 * therefore a silent no-op that leaves the inspector on everywhere. See
 * README §9 and `lib/inspector.ts`.
 *
 * `inspectorDefaultAnchor` used to sit alongside it, pinning the inspector
 * button bottom-left so it would not cover the prebuilt Popup and Sidebar
 * launchers. 1.69.3 removed the prop with no replacement — the provider now
 * exposes no positioning control at all — so on routes that mount those
 * launchers the inspector button overlaps them again.
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

/**
 * Hoisted to module scope on purpose — this must be a STABLE reference.
 *
 * Written inline as `headers={{ ... }}` it is a fresh object on every render,
 * and the provider treats a changed `headers` identity as a changed request
 * config: it rebuilds its client, which re-fetches thread lists and re-opens
 * realtime subscriptions. With a large agent registry that turns one re-render
 * into a burst of `GET /threads` + `POST /threads/subscribe` per agent, over
 * and over. The values are module constants, so the object never needs a new
 * identity.
 */
const IDENTITY_HEADERS = {
  "x-user-id": DEMO_USER_ID,
  "x-user-name": DEMO_USER_NAME,
} as const;

export function Providers({ children }: { children: ReactNode }) {
  // The inspector can only watch the core it is attached to, and two of them
  // on one page is fatal — so on routes that bring their own provider, this
  // one yields. `lib/inspector.ts` owns that decision.
  const pathname = usePathname();

  return (
    <CopilotKitProvider
      runtimeUrl={RUNTIME_URL}
      headers={IDENTITY_HEADERS}
      // Spread rather than passed as `publicLicenseKey={undefined}`: an
      // explicit undefined is still a supplied prop, and the provider treats a
      // present-but-empty key differently from an absent one.
      {...(PUBLIC_LICENSE_KEY ? { publicLicenseKey: PUBLIC_LICENSE_KEY } : {})}
      enableInspector={rootInspectorSetting(pathname)}
      onError={(event) => {
        console.error(`[CopilotKit ${event.code}]`, event.error);
      }}
    >
      {/*
        Must sit INSIDE the provider — it reads the core through
        `useCopilotKit()`. Renders nothing; it only caps realtime thread
        subscriptions at one agent. See the file for why that is necessary.
      */}
      <RestOnlyThreadStores />
      {children}
    </CopilotKitProvider>
  );
}
