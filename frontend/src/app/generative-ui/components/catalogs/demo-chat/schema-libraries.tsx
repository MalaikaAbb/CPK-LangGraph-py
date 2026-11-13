// "Pick a schema library". The page prints two `props:` lines, one per tab,
// not a catalog; the catalog around them is repo-authored scaffolding so each
// line can be used by a real component. The two `props` values are verbatim.
//
// The catalog extends `standardUI` so the agent has a Row or Column to hold
// both cards. A surface has one root, and without a container the agent made a
// card the root and gave it `children`, which the card does not declare.
import { z } from "zod";
import * as v from "valibot";
import { toStandardJsonSchema } from "@valibot/to-json-schema";
import { createGenerativeUI, standardUI } from "@copilotkit/react-core/v2/generative-ui";

import { ScaffoldProductCard } from "../../_shared/scaffolding";

export const schemaLibrariesUI = createGenerativeUI({
  id: "harness/schema-libraries@1",
  extends: [standardUI],
  components: {
    ZodProductCard: {
      component: ScaffoldProductCard,
      description: "A product, with its props declared in zod.",
      props: z.object({ name: z.string(), price: z.number() }),
    },
    ValibotProductCard: {
      component: ScaffoldProductCard,
      description: "A product, with its props declared in Valibot.",
      props: toStandardJsonSchema(v.object({ name: v.string(), price: v.number() })),
    },
  },
});
