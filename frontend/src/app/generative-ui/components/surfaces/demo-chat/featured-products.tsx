"use client";

// "Add a page target", as published. `Product` and `ProductRow` are used but
// never defined or imported on the page; the marked import supplies them.
import { GenerativeUISurface } from "@copilotkit/react-core/v2/generative-ui";
import { shopUI } from "./catalog";
import { ProductRow, type Product } from "../../_shared/scaffolding"; // Repo-authored scaffolding.

export function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <GenerativeUISurface
      id="featured"
      ui={shopUI}
      description="The Featured Products row of the home page. When the customer asks to see products here, show them as a ProductGrid with one ProductCard for each product. When they ask for the featured products again, delete this surface."
      components={["ProductGrid", "ProductCard"]}
      fallback={<ProductRow products={products} />}
    />
  );
}
