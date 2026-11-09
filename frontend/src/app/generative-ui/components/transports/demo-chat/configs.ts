// The Transports page's three provider samples. Each `generativeUI` value is
// verbatim; the provider around it (and its runtimeUrl) lives in the demo.
import { standardUI, type GenerativeUIConfig } from "@copilotkit/react-core/v2/generative-ui";

/** "Tool transport". */
export const toolTransport: GenerativeUIConfig = { ui: standardUI };

/** "Markdown transport". */
export const markdownTransport: GenerativeUIConfig = { ui: standardUI, transport: "markdown" };

/** "Only some agents". */
export const someAgents: GenerativeUIConfig = { ui: standardUI, agentIds: ["shop"] };
