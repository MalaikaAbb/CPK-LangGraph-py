// "Combine catalogs", as published. The snippet uses `z`, `cartUI` and `Hero`
// without importing or defining them; the two lines marked below supply them.
import { createGenerativeUI, standardUI } from "@copilotkit/react-core/v2/generative-ui";
import { z } from "zod"; // Repo-authored: the snippet uses z without importing it.
import { cartUI, Hero } from "../../_shared/scaffolding"; // Repo-authored scaffolding.

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI, cartUI],
  components: { Hero: { component: Hero, props: z.object({ title: z.string() }) } },
});
