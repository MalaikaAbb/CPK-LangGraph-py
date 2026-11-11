# Agent Config

> Forward typed configuration from your UI into the agent's reasoning loop.


<!-- interactive demo: agent-config -->


You have a working agent and want the user to be able to tune how it behaves: tone, expertise level, response length, language, persona. By the end of this guide, your UI will own a typed config object that the agent reads on every run and rebuilds its system prompt from.

## When to use this

Reach for agent config whenever the agent's behaviour depends on user-controllable settings that don't fit naturally as chat input:

- **Tone, voice, persona**: "playful", "formal", "casual"
- **Expertise level**: "beginner", "intermediate", "expert"
- **Response shape**: short / medium / long, structured / prose, language
- **Domain switches**: which knowledge base to consult, which tool subset to enable

If the values are a *channel* the user occasionally tunes (a settings panel, a toolbar of selects), agent config is the right shape. If the values are *content* the agent should write back to (notes, a document, a plan), use [Shared State](/langgraph-python/shared-state) instead.

How agent config flows from the UI into the agent's reasoning loop depends on your runtime architecture. Agents living behind a runtime read it from agent state on every run, while in-process agents receive the same object as forwarded properties on the provider — same UX, slightly different wiring on each side.



## How it works

<Steps>
  <Step>
    ### Install the LangGraph Python SDK

    <InstallPythonSDK />

  </Step>
  <Step>
    ### Wire CopilotKit middleware into your graph

    Agent config flows from the UI into the agent via `useAgentContext` — the
    frontend publishes a typed object and `CopilotKitMiddleware` injects it
    into the model's prompt on every turn. Make sure the middleware is in
    your `create_agent` call.

    
~~~~python title="agent_config_agent.py"
graph = create_agent(
    model=ChatOpenAI(reasoning_effort="none", model="gpt-6-luna", temperature=0.4),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt=SYSTEM_PROMPT,
)
~~~~


    Read the resulting config inside your system prompt or a custom
    middleware — see `src/agents/agent_config_agent.py` for the full
    rulebook-driven shape used in the showcase.

  </Step>
</Steps>

Agent config is a typed object the frontend owns and publishes to the agent as
runtime context. The backend reads that context entry and turns it into a
system prompt.


Hold the typed config in React state, then mirror every change into the agent
through `useAgentContext`:

```tsx title="frontend/src/app/page.tsx — UI publishes the typed config"
function ConfigContextRelay({ config }: { config: AgentConfig }) {
  useAgentContext({
    description: "Agent response preferences",
    value: {
      tone: config.tone,
      expertise: config.expertise,
      responseLength: config.responseLength,
    },
  });
  return null;
}
```




The framework setup above shows the exact backend bridge for the selected
agent. In every framework, the flow is the same: read the latest valid context
from the current run and use it to build the system prompt for that turn.

```text title="Backend flow"
config = latestValidConfig(currentRun.context)
systemPrompt = buildSystemPrompt(config)
model.invoke(systemPrompt, currentUserRequest)
```

The agent reads the latest typed config at the start of every turn, rebuilds the system prompt, runs the turn. This is the same shape as the [shared-state write-side pattern](/langgraph-python/shared-state#writing-to-agent-state); agent config is just a specific use of that pattern with a UI-owned typed object on top.





<IntegrationGrid path="agent-config" />
