# deploy-langsmith — verbatim from the docs

Code blocks from https://docs.copilotkit.ai/langgraph-python/deploy-langsmith,
fetched 2026-11-09 from the page's rendered RSC payload. Byte-for-byte except
for stripped `[!code highlight]` markers. Not imported or run: deploying needs
a LangSmith account and `langgraph deploy`.

- Deploy: `install-cli.sh`, `new-project.sh`, `langgraph.json`, `env.example`, `deploy.sh`.
- Google ADK variant: `adk-install.sh`, `adk-agent.py`, `adk-langgraph.json`, `adk-local-dev.sh`.
- Connect the frontend: `install-frontend.sh`, `route.ts`, `providers.tsx`,
  `layout.tsx`, `page.tsx`, `env.local`, `dev.sh`.
- Local / self-hosted: `local-dev-python.sh`, `local-dev-typescript.sh`,
  `local-env.example`, `server.py`.
