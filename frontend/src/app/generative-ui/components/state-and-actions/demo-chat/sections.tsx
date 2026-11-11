"use client";

import { exportA2UICatalog } from "@copilotkit/react-core/v2/generative-ui";

import { CartView, PRODUCTS, useCart } from "../../_shared/scaffolding";
import { callersUI } from "./declarations";
import { CartActions } from "./functions-catalog";
import { CartState } from "./state-catalog";

/**
 * Harness scaffolding: the app around each published hook. The page shows
 * the hooks mounted with a `cart`; where that cart lives and how the page
 * changes it are not on the page.
 */

/** App state (bind): CartState pushes the cart; the buttons are scaffolding. */
export function StateSection() {
  const cart = useCart();
  return (
    <div className="space-y-3 text-sm">
      <CartState cart={cart} />
      <p className="text-xs text-slate-500">
        Product ids in this app: {PRODUCTS.map((p) => p.id).join(", ")}. Add
        some, then ask for cards — the inCart line comes from this state, not
        the agent.
      </p>
      <div className="flex gap-2">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => cart.addItem(p.id, 1)}
            className="rounded border px-2 py-1 text-xs"
          >
            + {p.id}
          </button>
        ))}
      </div>
      <CartView cart={cart} />
    </div>
  );
}

/** Functions (click): CartActions handles the card's onAddToCart. */
export function FunctionsSection() {
  const cart = useCart();
  return (
    <div className="space-y-3 text-sm">
      <CartActions cart={cart} />
      <p className="text-xs text-slate-500">
        A card&apos;s &ldquo;Add to cart&rdquo; runs addToCart here, with no
        message to the agent.
      </p>
      <CartView cart={cart} />
    </div>
  );
}

/** Who may call a function: no chat, the declarations as exported. */
export function DeclarationsSection() {
  const catalog = exportA2UICatalog(callersUI);
  return (
    <div className="text-xs">
      <p className="font-semibold">
        exportA2UICatalog(callersUI).functions — addToCart, track, reload
      </p>
      <pre className="mt-1 max-h-[70vh] overflow-auto rounded bg-slate-100 p-2 dark:bg-slate-900">
        {JSON.stringify(
          Object.fromEntries(
            ["addToCart", "track", "reload"].map((k) => [k, catalog.functions[k]]),
          ),
          null,
          2,
        )}
      </pre>
    </div>
  );
}
