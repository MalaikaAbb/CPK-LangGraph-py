"use client";

import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";
import { useState } from "react";

import { PRODUCTS } from "../../_shared/scaffolding";
import { shopUI } from "./catalog";

/**
 * The page's three one-line targets. Each JSX element is verbatim; the
 * surrounding layout and the product picker are harness scaffolding — the
 * page shows the elements, not where they sit.
 */

/** "Limit the components". */
export function LimitedFeatured() {
  return <GenerativeUISurface id="featured" ui={shopUI} components={["ProductGrid", "ProductCard"]} />;
}

/** "Scroll to the surface". */
export function SidebarNotes() {
  return <GenerativeUISurface id="sidebar-notes" autoScroll={false} />;
}

/** "One target for each item". The picker is scaffolding; the surface is verbatim. */
export function Recommendations() {
  const [product, setProduct] = useState(PRODUCTS[0]);
  return (
    <div className="space-y-2">
      <div className="flex gap-2 text-xs">
        {PRODUCTS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProduct(p)}
            className={`rounded border px-2 py-1 ${p.id === product.id ? "border-[var(--accent)] text-[var(--accent)]" : "border-slate-300"}`}
          >
            {p.name}
          </button>
        ))}
      </div>
      <GenerativeUISurface
        key={product.id}
        id={`recommendations-${product.id}`}
        description={`The "You might also like" row under ${product.name}. Show related products here. Never include ${product.name} itself.`}
      />
    </div>
  );
}
