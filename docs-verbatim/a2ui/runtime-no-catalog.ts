import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";

const runtime = new CopilotRuntime({
  agents: { default: myAgent },
  a2ui: { injectA2UITool: true },
  runner: new InMemoryAgentRunner(),
});
