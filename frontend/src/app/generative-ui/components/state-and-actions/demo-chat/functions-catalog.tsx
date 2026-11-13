"use client";

// "Run your code on a click", as published: the catalog, CartActions, and the
// ProductCard that calls the event. The page prints them as three snippets
// with partial imports; `z`, `createGenerativeUI` and `Cart` are supplied by
// the marked lines. `ProductCard` is declared before the catalog uses it here
// only because it has to live in the same module.
import { z } from "zod"; // Repo-authored import.
import { createGenerativeUI } from "@copilotkit/react-core/v2/generative-ui"; // Repo-authored import.
import type { Cart } from "../../_shared/scaffolding"; // Repo-authored scaffolding.

import { useState } from "react";
import type { GenerativeUIComponentProps } from "@copilotkit/react-core/v2/generative-ui";

function ProductCard({ productId, name, onAddToCart }: GenerativeUIComponentProps<typeof shopUI, "ProductCard">) {
  const [error, setError] = useState<string>();
  return (
    <article>
      <h4>{name}</h4>
      <button
        onClick={async () => {
          const result = await onAddToCart?.({ productId });
          if (result && !result.ok) setError(result.error.message);
        }}
      >
        Add to cart
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </article>
  );
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  functions: {
    addToCart: {
      description: "Add a product to the cart",
      parameters: z.object({ productId: z.string(), quantity: z.number().default(1) }),
    },
  },
  components: {
    ProductCard: {
      component: ProductCard,
      props: z.object({ productId: z.string(), name: z.string() }),
      events: { onAddToCart: {} },
    },
  },
});

import { useGenerativeUIFunction } from "@copilotkit/react-core/v2/generative-ui";

export function CartActions({ cart }: { cart: Cart }) {
  useGenerativeUIFunction(shopUI, "addToCart", ({ productId, quantity }) => {
    cart.addItem(productId, quantity);
    return { added: productId };
  });
  return null;
}
