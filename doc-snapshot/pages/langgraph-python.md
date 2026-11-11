# Introduction

> Redirect notice for a landing page that is served from a data record.

{/*
  This folder's landing page is not served from here.

  Every slug that uses it (`langgraph-python` and its variants) is `docs_mode:
  generated` and has an entry in `src/data/frameworks/`, and the framework root
  route gates on `overview && docsMode === "generated"` — so the record wins and
  this file's `<FrameworkOverview>` never rendered. It still carried a full copy
  of the landing page, which drifted: this file said "Bring your LangGraph
  agents", the record rendered "Bring your LangChain agents", and only the
  record was ever on screen.

  Edit `src/data/frameworks/langgraph-python.ts` instead.
*/}


<div className="reference-content">

## Already have LangGraph conversations?

When you add a user-facing app to an existing LangGraph agent, your users may need to open and continue conversations they already started. [CopilotKit Intelligence](/langgraph-python/intelligence/overview) can import supported LangGraph history as threads so your app does not start with an empty thread list.

The importer reads LangGraph Server, LangGraph Platform, or LangSmith Deployment thread and run APIs. It does not import standalone LangChain message stores, LangSmith traces, or embedded checkpointers that are not exposed through those APIs.

Import history once; future CopilotKit-mediated runs synchronize with Intelligence and continue through LangGraph's native persistence path when your durable checkpointer or Platform deployment remains configured. This is not a continuous mirror of runs made outside CopilotKit.

[Import and synchronize LangGraph threads](/langgraph-python/threads-import) for source setup, agent mapping, and thread continuity.

</div>
