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
 * What the app-wide provider should pass as `showDevConsole`.
 *
 * `"auto"` means localhost-only; `false` means "a nested provider owns the
 * inspector on this route".
 */
export function rootInspectorSetting(pathname: string | null): "auto" | false {
  if (!INSPECTOR_ENABLED) return false;
  if (pathname && (NESTED_PROVIDER_ROUTES as readonly string[]).includes(pathname)) {
    return false;
  }
  return "auto";
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
