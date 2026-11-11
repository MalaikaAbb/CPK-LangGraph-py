// "Who may call a function": the page prints a `functions:` fragment only.
// The catalog around it is repo-authored scaffolding; the three function
// declarations are verbatim.
import { z } from "zod";
import { createGenerativeUI } from "@copilotkit/react-core/v2/generative-ui";

export const callersUI = createGenerativeUI({
  id: "harness/callers@1",
  functions: {
    addToCart: { parameters: z.object({ productId: z.string() }), allowedCallers: "rendererOrAgent", returnType: "object" },
    track: { parameters: z.object({ event: z.string() }), returnType: "void" },
    reload: { parameters: z.object({}), allowedCallers: "agentOnly" },
  },
  components: {},
});
