// Repo-authored — NOT from the docs.
//
// The page's "Show live app state" and "Run your code on a click" catalogs
// declare only `ProductCard`. A surface has a single root, so a request for
// two cards needs a container the catalogs do not have: the agent invents one
// (`HorizontalLayout`), the browser rejects the `createSurface`, and nothing
// renders.
//
// These wrappers give the provider `standardUI`'s layout components alongside
// the published catalogs, which stay untouched in `state-catalog.tsx` and
// `functions-catalog.tsx`. `extends` carries each base's `state`, `functions`
// and `bind` across, and `useGenerativeUIState` / `useGenerativeUIFunction`
// look keys up on the provider's catalog, so `CartState` and `CartActions`
// work unchanged. Same pattern as `events-catalog.tsx`.
import { createGenerativeUI, standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { shopUI as functionsShopUI } from "./functions-catalog";
import { shopUI as stateShopUI } from "./state-catalog";

export const stateWithLayoutUI = createGenerativeUI({
  id: "harness/state-with-layout@1",
  extends: [standardUI, stateShopUI],
  components: {},
});

export const functionsWithLayoutUI = createGenerativeUI({
  id: "harness/functions-with-layout@1",
  extends: [standardUI, functionsShopUI],
  components: {},
});
