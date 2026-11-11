# deploy-agentcore — verbatim from the docs

Code blocks from https://docs.copilotkit.ai/langgraph-python/deploy-agentcore,
fetched 2026-11-09 from the page's rendered RSC payload. Byte-for-byte except
for stripped `// [!code highlight]` markers. Not imported, compiled or run:
deploying needs an AWS account (CDK, Cognito, AgentCore Runtime).

- "Start from scratch": `create-langgraph.sh`, `config.yaml`, `deploy-langgraph.sh`,
  `local-docker.sh`, `destroy.sh` (Strands variants kept for completeness).
- "I already have an agent": `install-existing-agent.sh`, `route.ts`,
  `agent-core-runner.ts`, `providers.tsx`, `layout.tsx`, `page.tsx`,
  `env.local`, `dev.sh`.
- Troubleshooting: `401-error.txt`.
