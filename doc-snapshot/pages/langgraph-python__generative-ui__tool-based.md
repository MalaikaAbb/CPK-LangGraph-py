# Components as Tools

> Let your agent render rich React components directly in the chat by calling them as tools.


<!-- interactive demo: gen-ui-tool-based -->


## What is this?

Tool-based Generative UI is the simplest form of Generative UI: you register
a React component with `useComponent`, and CopilotKit exposes it to the
agent as a tool. When the agent calls the tool, CopilotKit renders your
component inline in the chat, passing the tool's arguments straight through
as typed props.

Unlike [tool rendering](/langgraph-python/generative-ui/tool-rendering), which wraps a
real backend tool in a custom UI, tool-based GenUI is the component. There
is no handler, no user interaction, no server-side execution. The agent
decides when to show it, populates the data, and CopilotKit paints it.

## When should I use this?

Use `useComponent` when you want to:

- Display rich UI (cards, charts, tables, dashboards) inline in the chat
- Show structured data the agent has derived from its reasoning
- Render previews, status indicators, or visual summaries
- Let the agent present information beyond plain text

For components that need user interaction, see
[Human-in-the-loop](/langgraph-python/human-in-the-loop). For operational transparency
around a real backend tool, see [Tool rendering](/langgraph-python/generative-ui/tool-rendering).

## How it works in code

<Steps>
  <Step>
    ### Install the LangGraph Python SDK

    <InstallPythonSDK />

  </Step>
  <Step>
    ### Wire CopilotKit middleware into your graph

    Frontend tools registered with `useFrontendTool` are forwarded to your
    agent at runtime. `CopilotKitMiddleware` is the bridge — drop it into
    `create_agent`'s `middleware` list and the LLM sees the forwarded tool
    definitions on every turn.

    
~~~~python title="frontend_tools.py"
from langchain.agents import create_agent
from langchain_openai import ChatOpenAI
from copilotkit import CopilotKitMiddleware

graph = create_agent(
    model=ChatOpenAI(model="gpt-5.4"),
    tools=[],
    middleware=[CopilotKitMiddleware()],
    system_prompt="You are a helpful, concise assistant.",
)
~~~~


  </Step>
</Steps>

`useComponent` takes a name, a Zod schema for its props, and the component
to render. The runtime registers it as a frontend tool so the agent can
discover it, and Zod validates the LLM's arguments before they reach your
component.

```typescript
// src/app/demos/gen-ui-tool-based/page.tsx
  useComponent({
    name: "render_bar_chart",
    description: "Display a bar chart with labeled numeric values.",
    parameters: barChartPropsSchema,
    render: BarChart,
  });
```

The component itself is ordinary React: it reads only its props and can
stream in as the agent fills the payload. The example above uses
[Recharts](https://recharts.org) for the bar chart; it doesn't know
anything about CopilotKit.

<Callout type="info">
  The `name` you pass to `useComponent` is what the agent sees as the tool
  name. Make it a verb like `render_bar_chart` or `show_weather` so the LLM
  reliably picks it when the user asks for that visualization.
</Callout>

<IntegrationGrid path="generative-ui/tool-based" />
