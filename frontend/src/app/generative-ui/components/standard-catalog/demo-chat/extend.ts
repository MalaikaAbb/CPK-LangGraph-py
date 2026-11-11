// "Add your own components", as published. `ProductCard` and `productSchema`
// are used but never defined on the page; the marked import supplies them.
import { createGenerativeUI, standardUI } from "@copilotkit/react-core/v2/generative-ui";
import {
  ScaffoldProductCard as ProductCard,
  productSchema,
} from "../../_shared/scaffolding"; // Repo-authored scaffolding.

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI],
  components: {
    ProductCard: { component: ProductCard, props: productSchema },
  },
});
