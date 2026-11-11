// Repo-authored: the Surfaces page imports `shopUI` from "./catalog" without
// printing it. The Catalogs page's `app/catalog.tsx` is the one it means
// (ProductGrid + ProductCard), so it is re-exported from there unchanged.
export { shopUI } from "../../catalogs/demo-chat/catalog";
