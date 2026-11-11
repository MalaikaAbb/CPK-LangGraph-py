// "Drop components", as published. The snippet uses `createGenerativeUI` and
// `standardUI` without importing them.
import { createGenerativeUI, standardUI } from "@copilotkit/react-core/v2/generative-ui"; // Repo-authored import.

export const appUI = createGenerativeUI({
  id: "acme/app@1",
  extends: [standardUI.omit(["Map", "Video", "HtmlView"])],
  components: {},
});
