"use client";

// "Show live app state", as published (the catalog, then CartState). The page
// prints neither file's imports, nor `ProductCard` or `Cart`; the marked
// lines supply them.
import { z } from "zod"; // Repo-authored import.
import { createGenerativeUI } from "@copilotkit/react-core/v2/generative-ui"; // Repo-authored import.
import {
  ScaffoldProductCard as ProductCard,
  type Cart,
} from "../../_shared/scaffolding"; // Repo-authored scaffolding.

const cartSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
});

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  state: { cart: cartSchema },
  components: {
    ProductCard: {
      component: ProductCard,
      props: z.object({ productId: z.string(), name: z.string(), inCart: z.number() }),
      bind: {
        inCart: (state, { productId }) =>
          state.cart.items.find((item) => item.productId === productId)?.quantity ?? 0,
      },
    },
  },
});

import { useGenerativeUIState } from "@copilotkit/react-core/v2/generative-ui";

export function CartState({ cart }: { cart: Cart }) {
  useGenerativeUIState(shopUI, "cart", { items: cart.items });
  return null;
}
