import {
  CopilotRuntime,
  createCopilotRuntimeHandler,
  InMemoryAgentRunner,
} from "@copilotkit/runtime/v2";
import { HttpAgent } from "@ag-ui/client";
import { AgentCoreRunner } from "./agent-core-runner";

const runtime = new CopilotRuntime({
  agents: {
    my_agent: new HttpAgent({
      url: process.env.AGENTCORE_ENDPOINT_URL!, // your /invocations URL
      headers: {
        Authorization: `Bearer ${process.env.AGENTCORE_ACCESS_TOKEN}`,
      },
    }),
  },
  runner: new AgentCoreRunner(),
});

const handler = createCopilotRuntimeHandler({
  runtime,
  basePath: "/api/copilotkit",
});

export const GET = handler;
export const POST = handler;
