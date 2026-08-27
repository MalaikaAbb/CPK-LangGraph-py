import {
  CopilotKitIntelligence,
  CopilotRuntime,
  InMemoryAgentRunner,
  type AgentsConfig,
  type CopilotRuntimeOptions,
} from "@copilotkit/runtime/v2";

/**
 * One place that decides whether this harness runs on CopilotKit Intelligence,
 * shared by all three runtime routes.
 *
 * `CopilotRuntimeOptions` is a **union**, not one object with optional fields:
 * Intelligence mode requires both `intelligence` and `identifyUser`, and SSE
 * mode requires `intelligence` to be absent entirely. So the two shapes are
 * built in separate branches below rather than spread conditionally into one
 * literal — TypeScript rejects the conditional-spread version.
 */

/**
 * Server-side only, and deliberately not `NEXT_PUBLIC_`. A project key prefixed
 * for the browser would ship in the JS bundle.
 */
const INTELLIGENCE_API_KEY = process.env.INTELLIGENCE_API_KEY;

/**
 * A SECOND, SEPARATE credential — and one of the two things that unlock the
 * Threads Drawer's UI.
 *
 * `INTELLIGENCE_API_KEY` authorizes the runtime against the platform: it is
 * what makes `/info` report intelligence mode and what makes the thread REST
 * endpoints return real rows. It does NOT advertise a license.
 *
 * `licenseToken` is what does. The runtime builds a license checker from it,
 * and `/info` reports `licenseStatus` off that checker. Client-side feature UIs
 * read that field: `<CopilotThreadsDrawer>` renders its locked "Threads are a
 * CopilotKit Intelligence feature" view unless the status is valid, whether or
 * not threads actually work.
 *
 * So a runtime can serve threads perfectly while every drawer in the app shows
 * an Upgrade button. The drawer doc's own sample takes the other route to the
 * same place — a `publicLicenseKey` on the provider. This harness supports
 * both; see `components/providers.tsx`.
 */
const LICENSE_TOKEN = process.env.COPILOTKIT_LICENSE_TOKEN;

/** True when `INTELLIGENCE_API_KEY` is set. Read by the Quickstart page. */
export const INTELLIGENCE_ENABLED = Boolean(INTELLIGENCE_API_KEY);

/** True when either license credential is configured. */
export const LICENSE_CONFIGURED = Boolean(
  LICENSE_TOKEN || process.env.NEXT_PUBLIC_COPILOTKIT_PUBLIC_LICENSE_KEY,
);

/** The options every route shares — everything except the mode-specific keys. */
type SharedRuntimeOptions = {
  agents: AgentsConfig;
  a2ui?: CopilotRuntimeOptions["a2ui"];
  transcriptionService?: CopilotRuntimeOptions["transcriptionService"];
};

/**
 * Build a runtime in whichever mode the environment supports.
 *
 * Without `INTELLIGENCE_API_KEY` the runtime falls back to SSE with an
 * in-memory runner. Chat still works on every route in this harness; the three
 * Rich Threads routes degrade, and the key is never read. That degradation is
 * deliberate — the harness has to stay runnable by someone who only has an
 * OpenAI key and a LangGraph server.
 */
export function buildRuntime(options: SharedRuntimeOptions): CopilotRuntime {
  if (!INTELLIGENCE_API_KEY) {
    return new CopilotRuntime({
      ...options,
      runner: new InMemoryAgentRunner(),
      ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    });
  }

  return new CopilotRuntime({
    ...options,
    ...(LICENSE_TOKEN ? { licenseToken: LICENSE_TOKEN } : {}),
    intelligence: new CopilotKitIntelligence({
      // apiUrl and wsUrl default to the managed platform — leave them unset.
      apiKey: INTELLIGENCE_API_KEY,
    }),
    // Threads are per-user. Without this, every visitor shares one history.
    // `Providers` sends these headers so the harness has a stable identity to
    // key threads on; a real app would read them from a verified session, as
    // the Thread Lifecycle page's "Scope Rich Threads to the signed-in user"
    // section shows.
    identifyUser: (request) => ({
      id: request.headers.get("x-user-id") ?? "anonymous",
      name: request.headers.get("x-user-name") ?? "Anonymous",
    }),
  });
}
