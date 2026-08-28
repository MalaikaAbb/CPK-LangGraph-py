/**
 * Who owns the Inspector, decided in exactly one place.
 *
 * Two facts about `CopilotKitInspector` drive everything here:
 *
 *  1. **It is bound to one core.** The provider renders it as
 *     `<CopilotKitInspector core={copilotkit} />`, where `copilotkit` is *that
 *     provider's* instance. An inspector on the root provider is blind to a
 *     nested provider's traffic — you get a working inspector showing an empty
 *     event list, which reads like a broken inspector.
 *  2. **Two on one page is fatal.** Both are lit custom elements; mounting two
 *     spins lit-html into an unbounded assert loop that Next mirrors to the dev
 *     server, taking out the tab, the server, and potentially the machine.
 *
 * Together those mean: exactly one inspector per page, and it must be the one
 * attached to the provider the page's chat actually runs on. Three demo routes
 * mount their own `<CopilotKit>`, so on those the root provider stands down and
 * the nested one takes over.
 */

/** Kill switch — `NEXT_PUBLIC_COPILOTKIT_INSPECTOR=off` disables it everywhere. */
export const INSPECTOR_ENABLED =
  process.env.NEXT_PUBLIC_COPILOTKIT_INSPECTOR !== "off";

/**
 * Routes whose page mounts its own `<CopilotKit>`.
 *
 * Add to this list if you add another nested provider, or its inspector will
 * be the second one on the page.
 */
export const NESTED_PROVIDER_ROUTES = [
  "/voice/demo-chat",
  "/generative-ui/a2ui/fixed-schema/demo-chat",
  "/generative-ui/a2ui/dynamic-schema/demo-chat",
] as const;

/**
 * Route subtrees where the Inspector is suppressed, on purpose.
 *
 * The Inspector is what turns the realtime thread defect from waste into a
 * broken agent. With it mounted, prompting fails with "Timed out joining
 * channel"; with it off, the same agent runs. Proven by A/B, with StrictMode on
 * in every case and `reactStrictMode: false` ruling React out:
 *
 *     inspector off                   -> agent runs
 *     inspector on                    -> Timed out joining channel
 *     inspector on + REST-only stores -> still fails
 *
 * The Rich Threads routes are the ones that actually exercise realtime threads,
 * so they are the ones that must stay runnable. Everywhere else keeps the
 * Inspector, which is the point of a QA harness.
 *
 * Prefix match, so each section and its `demo-chat` child are both covered.
 * See README §9.
 */
export const INSPECTOR_SUPPRESSED_PREFIXES = [
  "/headless-threads",
  "/threads-lifecycle",
  "/prebuilt-components/copilot-threads-drawer",
] as const;

/** True when `pathname` sits inside a suppressed subtree. */
function isInspectorSuppressedRoute(pathname: string): boolean {
  return INSPECTOR_SUPPRESSED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * What the app-wide provider should pass as `enableInspector`.
 *
 * It must be `enableInspector`, NOT `showDevConsole`. `CopilotKitProviderProps`
 * declares both, so `showDevConsole` typechecks — but the v2
 * `CopilotKitProvider` never destructures it, and the only gate it reads is:
 *
 *     shouldEnableInspector({ enableInspector, isBrowser, isDevelopment })
 *       => isBrowser && isDevelopment && enableInspector !== false
 *
 * So the inspector mounts in dev unless `enableInspector` is *explicitly*
 * `false`, and passing `showDevConsole` is silently a no-op. See README §9.
 *
 * That rule already is the old `"auto"` behaviour (dev + browser only), so:
 *   - `false`     — off: the kill switch, or a nested provider owns this route.
 *   - `undefined` — leave the package's dev-only default in place.
 */
export function rootInspectorSetting(pathname: string | null): false | undefined {
  if (!INSPECTOR_ENABLED) return false;
  if (pathname && (NESTED_PROVIDER_ROUTES as readonly string[]).includes(pathname)) {
    return false;
  }
  // Rich Threads routes: the Inspector breaks agent runs there.
  if (pathname && isInspectorSuppressedRoute(pathname)) return false;
  return undefined;
}

/**
 * What a nested `<CopilotKit>` should pass as `enableInspector`.
 *
 * `undefined` leaves the package's own default in place, which is the same
 * localhost-only rule the root provider uses. `false` honours the kill switch.
 */
export const nestedInspectorSetting: boolean | undefined = INSPECTOR_ENABLED
  ? undefined
  : false;
