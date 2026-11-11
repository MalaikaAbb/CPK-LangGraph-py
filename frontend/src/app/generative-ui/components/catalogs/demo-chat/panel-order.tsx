// "Positional parameter order", as published. The snippet uses
// `createGenerativeUI`, `z` and `Panel` without importing or defining them.
import { createGenerativeUI } from "@copilotkit/react-core/v2/generative-ui"; // Repo-authored import.
import { z } from "zod"; // Repo-authored import.
import { Panel } from "../../_shared/scaffolding"; // Repo-authored scaffolding.

const ui = createGenerativeUI({
  id: "acme/panel@1",
  components: {
    Panel: {
      component: Panel,
      props: z.object({ title: z.string(), color: z.string().optional() }),
      slots: { children: "multiple" },
      parameterOrder: ["title", "children"],
    },
  },
});

export { ui as panelUI }; // Repo-authored: the snippet's `ui` is module-local.
