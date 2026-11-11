"use client";

// Ported from the CPK-LangGraph-TS harness (PR #22), which ported it from
// aws-strands-ts (same framework-neutral doc page; snippets re-checked against
// docs.copilotkit.ai/langgraph-python on 2026-11-09 and identical). Harness
// glue points at this repo's `genui` LangGraph graph (Python).

/**
 * Repo-authored scaffolding — NOT from the docs.
 *
 * The Components and surfaces sub-pages publish fragments that use app pieces
 * they never define: `Product`, `ProductRow`, a `products` list, `Cart` with
 * `cart.addItem`, `Hero`, `Panel`, `Airport`, `Arrow`, `ProductCard` for some
 * catalogs, `productSchema`, `cartUI`. Each stand-in below is the smallest
 * thing that lets the published snippet run, and nothing more. Every use site
 * imports from here, so a reader can tell doc code from harness code by the
 * import alone.
 */

import { useCallback, useState } from "react";
import { z } from "zod";
import {
  createGenerativeUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

/** Repo-authored scaffolding: `Product` is used by the Surfaces page but not defined on it. */
export interface Product {
  id: string;
  name: string;
  price: number;
}

/** Repo-authored scaffolding: sample data for the page's own product row. */
export const PRODUCTS: Product[] = [
  { id: "p1", name: "Trail Runner", price: 120 },
  { id: "p2", name: "City Sneaker", price: 85 },
  { id: "p3", name: "Track Spike", price: 140 },
];

/** Repo-authored scaffolding: `ProductRow` is the Surfaces page's fallback, never defined there. */
export function ProductRow({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {products.map((p) => (
        <div
          key={p.id}
          className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
        >
          <p className="font-medium">{p.name}</p>
          <p className="text-slate-500">${p.price}</p>
        </div>
      ))}
    </div>
  );
}

/** Repo-authored scaffolding: `Cart` is used by State and actions but not defined on it. */
export interface Cart {
  items: { productId: string; quantity: number }[];
  addItem: (productId: string, quantity: number) => void;
}

/** Repo-authored scaffolding: a React-state cart behind the `Cart` shape. */
export function useCart(): Cart {
  const [items, setItems] = useState<Cart["items"]>([]);
  const addItem = useCallback((productId: string, quantity: number) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === productId);
      if (!found) return [...prev, { productId, quantity }];
      return prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i,
      );
    });
  }, []);
  return { items, addItem };
}

/** Repo-authored scaffolding: shows the cart so the effect of a click is visible. */
export function CartView({ cart }: { cart: Cart }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3 text-xs dark:border-slate-700">
      <p className="font-semibold">Cart (app state)</p>
      {cart.items.length === 0 ? (
        <p className="text-slate-500">Empty</p>
      ) : (
        <ul>
          {cart.items.map((i) => (
            <li key={i.productId} className="font-mono">
              {i.productId} × {i.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Repo-authored scaffolding: `Hero` is used by Catalogs' "Combine catalogs" but not defined. */
export function Hero({ title }: { title: string }) {
  return <h2 className="text-2xl font-bold">{title}</h2>;
}

/** Repo-authored scaffolding: `Panel` is used by "Positional parameter order" but not defined. */
export function Panel({
  title,
  color,
  children,
}: {
  title: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={{ borderColor: color }} className="rounded-lg border p-3">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  );
}

/** Repo-authored scaffolding: `productSchema` is used by Standard catalog but not defined. */
export const productSchema = z.object({ name: z.string(), price: z.number() });

/** Repo-authored scaffolding: a `ProductCard` for catalogs whose page names one but prints none. */
export function ScaffoldProductCard(props: {
  name?: string;
  price?: number;
  productId?: string;
  inCart?: number;
}) {
  return (
    <article className="rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700">
      <h4 className="font-medium">{props.name}</h4>
      {props.price !== undefined && <p>${props.price}</p>}
      {props.inCart !== undefined && (
        <p className="text-xs text-slate-500">In cart: {props.inCart}</p>
      )}
    </article>
  );
}

/** Repo-authored scaffolding: `Airport` is used by Adopt from A2UI's "After" catalog but not defined. */
export function Airport({ code, city }: { code: string; city: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold">{code}</p>
      <p className="text-xs text-slate-500">{city}</p>
    </div>
  );
}

/** Repo-authored scaffolding: `Arrow` is used by Adopt from A2UI's "After" catalog but not defined. */
export function Arrow() {
  return <span className="text-2xl">→</span>;
}

/**
 * Repo-authored scaffolding: `cartUI` is extended by Catalogs' "Combine
 * catalogs" but never defined. One component, so the merge has something to
 * merge.
 */
function CartBadge({ count }: GenerativeUIComponentProps<typeof cartUI, "CartBadge">) {
  return (
    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-white">
      Cart: {count}
    </span>
  );
}

export const cartUI = createGenerativeUI({
  id: "acme/cart@1",
  components: {
    CartBadge: {
      component: CartBadge,
      description: "A small badge with the number of items in the cart.",
      props: z.object({ count: z.number() }),
    },
  },
});
