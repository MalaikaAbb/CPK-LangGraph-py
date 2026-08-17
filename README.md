# CopilotKit + LangGraph (Python) Test Suite

A navigable, working test harness for the CopilotKit LangGraph (Python) integration — each doc page is a route that actually runs the thing it describes.

| | |
|---|---|
| **Doc sync date** | Machine-maintained — `doc-snapshot/manifest.json` → `syncedAt`, shown on `/` and `/doc-sync`, rewritten on every sync |
| **CopilotKit packages** | `@copilotkit/react-core` 1.66.2 · `@copilotkit/runtime` 1.66.2 · `@copilotkit/a2ui-renderer` 1.66.2 · `@copilotkit/voice` 1.66.2 |
| **CopilotKit Python SDK** | `copilotkit` 0.1.94 · `ag-ui-langgraph` 0.0.42 |
| **LangGraph / LangChain** | `langgraph` 1.2.10 · `langchain` 1.3.14 · `langchain-openai` 1.4.1 |
| **Frontend** | Next.js 16.3.0 (App Router) · React 19.2 · TypeScript · Tailwind 4 |
| **Backend** | Python 3.10+ · FastAPI 0.141 · Uvicorn 0.52 |
| **Doc snapshot** | Press **Sync docs now** on `/` — see `/doc-sync` and §7. Snapshot lives in `doc-snapshot/`. |
| **Build status** | No CI. Verified locally: lint ✅ (0 errors) · `/doc-sync` end-to-end ✅ (35-page baseline, severity classification, guards) · agent server boots with all 35 graphs mounted ✅ · 1 route ❌ Broken (§8) · **typecheck and `next build` currently fail** on `/programmatic-control/demo-chat` — see below |

---

## 2. Overview

[LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) is LangChain's framework for building stateful, graph-shaped agents. CopilotKit connects one to a React app over the [AG-UI protocol](https://ag-ui.com), which is what gives you streaming, tool calls, shared state, generative UI and human-in-the-loop against a graph you already own.

This repo covers a **scoped set of 34 doc pages** (§8). Each route implements what its page teaches and shows the exact source that makes it work, read off disk at render time.

**Everything comes from the documentation, including its bugs.** Where a page defined a graph, tool or middleware, it is reproduced. Where a page's published code is wrong against the installed packages, it is reproduced *anyway* and the mismatch is documented rather than quietly fixed — that is the point of a test harness. §9 lists every such case, plus everything the docs named but never printed.

Tracks: **<https://docs.copilotkit.ai/langgraph-python>**

---

## 3. Architecture

```
Browser (React 19)
  │  @copilotkit/react-core/v2 — CopilotKitProvider, CopilotChat, hooks
  │  POST /api/copilotkit
  ▼
Next.js 16 App Router  ·  localhost:3000
  │  Copilot Runtime (@copilotkit/runtime)
  │  one agent per registered graph id
  ▼
  ├── LANGGRAPH_TRANSPORT=fastapi    → LangGraphHttpAgent({ url })
  │     POST http://localhost:8123/<graph-id>
  │     backend/main.py  ·  add_langgraph_fastapi_endpoint per graph
  │
  └── LANGGRAPH_TRANSPORT=langsmith  → LangGraphAgent({ deploymentUrl, graphId })
        POST http://localhost:8123   ·  langgraph dev
        backend/langgraph.json  ·  34 graph entries
  ▼
LangGraph (Python)  ·  create_agent + CopilotKitMiddleware
  ▼
OpenAI  ·  gpt-4.1-mini  (o4-mini on the two reasoning routes)
```

**The backend is Python, so there really are two processes.** This is the main structural difference from the TypeScript integrations, where the agent can be imported into the Next process. Here it cannot, and the split is visible on every route.

### Both Quickstart tabs are real

The Quickstart documents two ways to serve a LangGraph agent and this repo implements **both**, switchable with one variable. They are not two spellings of one thing — different servers, different runtime classes, different persistence:

| | FastAPI | LangSmith |
|---|---|---|
| Server | `backend/main.py` (uvicorn) | `langgraph dev` (LangGraph CLI) |
| Mounting | `add_langgraph_fastapi_endpoint` per graph | `backend/langgraph.json` |
| Runtime class | `LangGraphHttpAgent({ url })` | `LangGraphAgent({ deploymentUrl, graphId })` |
| Routing by | URL path | `graphId` |
| Checkpointer | `MemorySaver`, compiled in | supplied by the platform |
| Extra key | none | `LANGSMITH_API_KEY` |

Set `LANGGRAPH_TRANSPORT` in **both** `backend/.env` and `frontend/.env.local`, then restart both processes. The graphs are byte-identical either way — the only place a graph module notices is `_shared.checkpointer()`, because a graph deployed to LangGraph Platform must not bring its own.

### Three runtime endpoints

| Endpoint | Why it exists |
|---|---|
| `/api/copilotkit` | All 35 graphs. Sets `a2ui: { injectA2UITool: false, agents: ["a2ui-fixed-schema"] }` — that agent owns its own `display_flight` tool and must not also be handed `generate_a2ui`. |
| `/api/copilotkit-voice/[[...slug]]` | `transcriptionService` exists only on the **v2** runtime; the v1 wrapper drops it. The catch-all lets the v2 handler own its sub-routing (`/info`, `/transcribe`, `/agent/:id/run`). |
| `/api/copilotkit-declarative-gen-ui` | Needs A2UI tool injection **on**, which the main runtime turns off. |

### The 35 graphs

One per route rather than one shared graph, so a conversation on one route does not bleed into the next. Registered in `backend/src/graphs/registry.py`, where the key is simultaneously the AG-UI agent id, the FastAPI mount path, and the `langgraph.json` graph id — so nothing has to translate between them. `langgraph.json` is *generated* from that registry (`python -m src.graphs.registry`), so the two transports can never disagree about which graphs exist.

| Group | Graphs |
|---|---|
| Quickstart | `sample_agent` |
| Prebuilt components | `agentic_chat` · `prebuilt-sidebar` · `prebuilt-popup` · `chat-controls` |
| Look and feel | `chat-customization-css` · `chat-slots` · `headless-simple` · `headless-complete` |
| Reasoning (o4-mini) | `reasoning-default` · `reasoning-custom` |
| Input modalities | `multimodal` · `voice-demo` |
| Generative UI | `tool-rendering` · `gen-ui-tool-based` · `a2ui-fixed-schema` · `declarative-gen-ui` |
| App control | `frontend-tools` · `hitl-in-chat` · `interrupt-flow` · `programmatic-control` · `interrupt-headless` |
| Shared state | `shared-state-read-write` · `shared-state-streaming` · `readonly-state-agent-context` · `shared-state-language` · `state-inputs-outputs` · `predictive-state-manual-emission` · `predictive-state-tool-emission` · `predictive-state-prebuilt` |
| Multi-agent | `subagents` |
| LangGraph runtime | `agent-config` · `agent-app-context` · `configurable` · `subgraphs` |

Ids follow each doc page's own demo id where it names one (`sample_agent`, `agentic_chat`, `prebuilt-sidebar`, `declarative-gen-ui`), which is why the casing is inconsistent — that inconsistency is the docs'.

---

## 4. Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Node.js | 20.3+ | Next.js 16 requires 20; `/doc-sync` additionally uses `AbortSignal.any`, added in 20.3. |
| npm | 10+ | Or pnpm/yarn/bun. |
| Python | 3.10+ | `copilotkit` 0.1.94 requires `>=3.10,<3.15`. |
| `uv` | any recent | Used for the backend venv. `pip` works too — see §5. |
| OpenAI API key | — | **Required.** <https://platform.openai.com/api-keys> |
| LangSmith API key | — | Only for the `langsmith` transport. |

No CopilotKit Cloud account is needed; no route here requires one.

---

## 5. Setup

```bash
git clone <this-repo> langgraph-python && cd langgraph-python
```

**1. Backend**

```bash
cd backend
uv venv
uv pip install -e .
```

<details>
<summary>Without <code>uv</code></summary>

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -e .
```
</details>

For the LangSmith transport, also install the CLI:

```bash
uv pip install -e ".[langsmith]"
```

**2. Frontend**

```bash
cd ../frontend
npm install
```

Plain `npm install` — no `--legacy-peer-deps`. (If you bump `zod` to 4 it will start failing; see §9.)

**3. Environment**

```bash
cd ..
cp .env.example backend/.env
cp .env.example frontend/.env.local
```

`.env.example` is annotated per variable and marks which block belongs to which file. The only one you must fill in is `OPENAI_API_KEY` in `backend/.env`.

| Variable | Where | What it does |
|---|---|---|
| `OPENAI_API_KEY` | `backend/.env` | **Required.** Read by every graph, server-side. Never reaches the browser. |
| `LANGGRAPH_TRANSPORT` | **both** | `fastapi` or `langsmith`. Must match on both sides. |
| `LANGGRAPH_DEPLOYMENT_URL` | `frontend/.env.local` | Where the agent server is. Defaults `http://localhost:8123`. |
| `LANGSMITH_API_KEY` | `frontend/.env.local` | Only used by the `langsmith` transport. |
| `AGENT_HOST` / `AGENT_PORT` | `backend/.env` | Where the FastAPI server listens. Defaults `0.0.0.0:8123`. |
| `LOG_LEVEL` | `backend/.env` | Uvicorn/LangGraph log level. Defaults `INFO`. |
| `OPENAI_MODEL` / `OPENAI_REASONING_MODEL` | `backend/.env` | Optional overrides. Default `gpt-4.1-mini` / `o4-mini`. |
| `OPENAI_API_KEY` | `frontend/.env.local` | Optional. Whisper transcription for the `/voice` mic only. |
| `NEXT_PUBLIC_COPILOTKIT_INSPECTOR` | `frontend/.env.local` | Optional. Set to `off` to disable the Inspector app-wide. |

**Default ports:** frontend **3000**, agent server **8123**.

---

## 6. Running the project

Two processes, two terminals.

**Terminal 1 — the agent server**

FastAPI transport (the default):

```bash
cd backend && uv run --env-file .env python main.py
```

Success looks like:

```
INFO:__main__:Mounted 35 graphs: a2ui-fixed-schema, agent-app-context, agent-config, ...
INFO:     Uvicorn running on http://0.0.0.0:8123 (Press CTRL+C to quit)
```

LangSmith transport instead:

```bash

npx @langchain/langgraph-cli dev --port 8123 --no-browser
```

Confirm every graph mounted (FastAPI only):

```bash
curl -s localhost:8123/health | python3 -m json.tool
# → { "status": "ok", "transport": "fastapi", "agents": [...], "count": 35 }
```

**Terminal 2 — the frontend**

```bash
cd frontend
npm run dev
```

```
▲ Next.js 16.3.0
- Local:   http://localhost:3000
✓ Ready in 1.2s
```

Open **<http://localhost:3000>**. `/status` cross-checks the frontend's agent list against the server's live `/health` and reports drift in either direction.

If chats fail immediately, the usual cause is the agent server not running, or `OPENAI_API_KEY` missing from *its* environment — the key belongs to the Python process, not the Next one.

---

## 7. What to expect — walkthrough per section

### How each route is split

| | |
|---|---|
| **`<route>`** | Notes, pass/fail criteria, and **the exact source**, read off disk at render time. No live chat. |
| **`<route>/demo-chat`** | Just the running feature, no chrome — built for screen recording. Reached via **Open demo ↗**, which always opens a new tab. |

Code on a page is never a re-typed approximation: each page reads real files via `src/lib/source.ts` and syntax-highlights them with Shiki at build time. Excerpts use `#region` markers that stay visible in the source.

### Getting Started

**`/`** — Orientation, the architecture diagram, the live transport readout, and the route roster.

**`/quickstart`** — A hand-rolled `StateGraph` with one `mock_llm` node, plus both deployment tabs side by side. **Try:** `Can you tell me a joke?` **Pass:** tokens stream. **Fail:** an error banner — check the Python server and its `OPENAI_API_KEY`.

### Prebuilt Components

**`/prebuilt-components/chat`** — `<CopilotChat>`, the primitive the other two wrap. **Pass:** suggestion pills render before the first message; clicking one sends it.

**`/prebuilt-components/sidebar`** — Docked, and a *sibling* of your content. **Pass:** the toggle collapses and restores it and the metric cards never move. **Fail:** the layout jumps — that is popup behaviour.

**`/prebuilt-components/popup`** — Overlays instead of docking. **Pass:** the placeholder reads "Ask the popup anything…" (from `labels`) and the cards behind never shift.

**`/prebuilt-components/chat-controls`** — `useCopilotChatConfiguration` for modal state, plus thumbs up/down. **Try:** press **Ask the assistant**, send a message, rate the reply. **Pass:** both buttons open the closed sidebar, the toggle's label flips, and rating appends a row with that message's id. **Fail:** the buttons do not render — nothing in the tree owns modal state.

### Custom Look and Feel

**`/custom-look-and-feel/css`** — v2 shadcn tokens plus `.copilotKit*` class hooks, scoped to one wrapper. **Pass:** warm parchment surface, square corners, your messages in mono behind a copper `→`.

**`/custom-look-and-feel/slots`** — All three override levels. **Pass:** a gradient welcome panel before sending; afterwards each reply sits in a tinted card with a "slot" badge and the disclaimer is custom.

**`/custom-look-and-feel/headless-ui`** — A chat with zero CopilotKit components. **Pass:** tokens stream into hand-written bubbles.

**`/custom-look-and-feel/reasoning-messages`** — Default card vs. two replaced sub-slots, toggleable. **Try:** the bat-and-ball puzzle. **Pass:** a reasoning card streams above the answer. **Fail:** no card — the model did not deliberate; ask something harder.

### Input Modalities

**`/multimodal-attachments`** — `attachments={{ enabled: true }}`. ⚠️ **Currently fails by upstream bug** — any image attachment 400s before reaching the model. The client-side rejection half still works: attach a `.zip` and an amber banner names it `invalid-type`. See §9 item 2.

**`/voice`** — A second runtime carrying a `TranscriptionService`. **Try:** the 🎙 sample-audio button. **Pass:** text lands in the composer and the agent answers in spoken-length prose. The mic itself needs `OPENAI_API_KEY` on the frontend. **Fail:** no mic button at all — the runtime has no transcription service, or `basePath` is wrong.

### Generative UI

**`/generative-ui/reasoning`** — The whole reasoning card replaced. **Pass:** an always-open banner tagged "Reasoning" rather than a collapsible card.

**`/generative-ui/tool-based`** — `useComponent` registering a bar chart as a tool. **Try:** `Chart the number of days in each month of 2026`. **Pass:** a chart renders inline and the reply does not repeat the numbers.

**`/generative-ui/tool-rendering`** — A named renderer for `get_weather` plus the wildcard. **Try:** `What's the weather in Tokyo?` **Pass:** a card shows "Calling weather API…" then fills in with 68°, Sunny. **Note:** asking for flights or stock prices produces prose — see §9.

**`/generative-ui/state-rendering`** — A document assembling live beside a docked chat. **Try:** `Write a short blog post about…` **Pass:** the main pane fills progressively with a LIVE badge; the text never appears as a chat message.

**`/generative-ui/a2ui/dynamic-schema`** — A secondary LLM designs the whole surface. **Try:** `Build me a dashboard for a SaaS company's Q3…` **Pass:** cards, metric tiles, a table and a chart, assembled differently each prompt. **Fail:** a wall of JSON — the middleware is not attached.

**`/generative-ui/a2ui/fixed-schema`** — A flight card from a JSON schema. **Try:** `Find me a flight from SFO to JFK`. **Pass:** an itinerary card with both airport codes, an airline badge, a price and a Book button. **Fail:** raw JSON — the `catalogId` does not match.

### App Control

**`/frontend-tools`** — `change_background` executing in the browser. **Try:** `Make the background a warm sunset gradient`. **Pass:** the page recolours and the CSS value under the heading updates.

**`/human-in-the-loop`** — `useHumanInTheLoop` suspending the run. **Try:** `Book an intro call with the sales team`. **Pass:** a picker renders and **nothing further streams** until you choose; the card then collapses to a green "Booked" badge.

**`/human-in-the-loop/interrupt-flow`** — LangGraph's native `interrupt()`, the pattern with no counterpart in the other integrations. Two tabs, one per doc example. **Try:** `Hello! Who are you?` **Pass (Single interrupt):** the run halts, a form appears, answering resumes the graph. **Multiple interrupts** renders nothing — that is the doc bug, reproduced verbatim. See §9 item 1.

**`/programmatic-control`** — the page's `headless-complete` send pipeline (`addMessage` / `runAgent` / `stopAgent`), reproduced verbatim. **Pass:** an empty frame — the snippet ends after the handlers and never publishes any JSX, so there is no UI to reproduce. See §9 item 19.

### Shared State

**`/shared-state`** — Both directions at once. **Try:** introduce yourself, then change Tone/Detail and ask a question. **Pass:** the scratch pad fills, and the next reply visibly changes register.

**`/shared-state/rendering-in-app`** — The same state as a main-view canvas. **Pass:** cards appear in the main view; clicking one removes it and the agent agrees it is gone.

**`/shared-state/streaming`** — `StateStreamingMiddleware` forwarding a tool argument mid-generation. **Pass:** the document fills a few words at a time. **Fail:** one jump at the end — the mapping is not in effect.

**`/shared-state/agent-readonly`** — `useAgentContext` as a one-way channel. **Try:** `Who am I and what have I been doing?` **Pass:** the agent answers from the panel and refuses to change those values.

**`/shared-state/in-app-agent-read`** — Reading `agent.state.language` from the page's own `chat_node` graph. **Try:** ask something, flip the toggle on Writing agent state, ask again. **Pass:** the readout tracks the slot and replies follow its language. Note there is no agent-side tool to change it — that is faithful to the docs.

**`/shared-state/in-app-agent-write`** — `setState`, with and without a re-run. **Try:** **Toggle Language**, then ask something; then **Toggle + re-run**. **Pass:** the first needs a message to take effect, the second replies immediately.

**`/shared-state/state-inputs-outputs`** — `input_schema` / `output_schema` filtering what crosses the wire. **Pass:** `answer` fills in, `question` stays undefined in `agent.state`, `resources` never arrives at all.

**`/shared-state/predictive-state-updates`** — All three of the page's variants, nested as it nests them (`agent-type`, then `state-emission`). **Try:** `Plan and execute a data migration`. **Pass:** `observed_steps` fills before the answer arrives. **Fail:** all at once at the end.

### Multi-Agent

**`/multi-agent/subagents`** — Supervisor → research → write → critique. **Try:** `Write a short paragraph explaining why agent-native UIs beat chatbots`. **Pass:** three log cards in order with role chips lighting up. **Fail:** the log stays empty, or the critic card stacks repeatedly.

### LangGraph Runtime

**`/agent-config`** — A typed config object published as runtime context. **Try:** ask the same question at `expertise=beginner` then `expert`. **Pass:** visibly different answers.

**`/agent-app-context`** — Live app state shared with `useAgentContext`. **Try:** `Draft a short email to the person I have selected`. **Pass:** it addresses whoever is selected, and follows when you change it.

**`/configurable`** — Per-run execution parameters. **Pass:** both forwarded keys show "arrived" — which disproves the page's filtering claim. See §9.

**`/subgraphs`** — A nested graph streaming its state live. **Pass:** the stage chip advances and findings appear in two waves *before* the summary. **Fail:** everything lands at once at the end.

### Observe & Operate

**`/status`** — Every route in one table, plus a live cross-check against the running agent server.

**`/doc-sync`** — Detects when the docs move out from under this repo. Press **Sync docs now** (on the landing page or here) and it fetches the markdown source behind all 35 tracked doc pages, diffs each against a stored snapshot, replaces the snapshot, and reports what changed — ranked by whether the change can actually break an implementation.

**Sections checked** lists every tracked doc page in nav order — Introduction, Quickstart, CopilotChat, CopilotSidebar, and so on down to Doc drift — each with a mark showing how it fared: `✓` unchanged, `!` changed, `+` stored for the first time, `✗` 404 upstream, `~` unstable. A neutral `·` means the page was not part of the last run, which is deliberately *not* a tick: "checked and fine" and "never checked" must not look alike.

Expanding a row shows the comparison behind its mark — for a changed page the diff, with `−` lines being the existing snapshot and `+` lines the copy just fetched. Unchanged pages have no diff by definition, so the row shows the two hashes that matched instead; that is the evidence the check really ran. Note that several routes share one doc page (`/`, `/status` and `/doc-sync` all track the framework root), so one upstream edit legitimately marks all three rows.

Try it: press the button twice in a row. The first press reports whatever drifted since the snapshot was taken; the second should report *No changes — every page matches the snapshot*, in roughly four seconds.

To see a real diff without waiting for CopilotKit to publish one, edit any `doc-snapshot/pages/*.md` file and press the button. Edit a line inside a code fence for **High**, a `##` heading for **Medium**, a sentence for **Low**. Nothing else needs changing — the comparison reads the stored file itself, so the edit is picked up on the next sync.

The diff is reported against your edited copy, and both `/doc-sync` and the changelog label it as a local snapshot edit rather than an upstream change, so a test never masquerades as real drift in the record. After the sync the file is replaced with upstream's copy again, so the edit is one-shot by design.

Success looks like: a **High** badge on a hunk that names its heading and language (e.g. *under How it works · `python`*), **Medium** for a changed heading, **Low** for reworded prose. Failure looks like every page reporting as changed at once — that means the snapshot was written with something other than markdown, and the structural guard should have prevented it; check the abort message.

Severity ranking depends entirely on the fence scanner knowing which lines sit inside a code block, and its edge cases are covered by `FENCE_FIXTURES` / `runFenceSelfCheck()` in `lib/doc-sync/diff.ts` — nested fences, tilde fences, unterminated fences, fences indented inside `<Tabs>`, backtick-in-info-string, front matter. Nothing in the app runs them any more, so if you change the annotator, exercise those fixtures yourself.

There is exactly one doc-sync date in the repo — `syncedAt` in `doc-snapshot/manifest.json`, rewritten every time the button runs and shown on `/`, `/status` and `/doc-sync`. There is no separate hand-maintained date to keep in step with it.

#### `doc-snapshot/CHANGELOG.md`

The sync replaces the snapshot as part of comparing against it, so the run *after* a change reports nothing — the basis it would have compared against is gone. The live report on `/doc-sync` therefore only ever describes the most recent run. The changelog is the record that survives that: it is written at the moment of discovery and never rewritten by a later run.

- **Only changes are recorded.** A sync where everything matched does not touch the file — it is not created, not rewritten, and its timestamp does not move. Baseline and aborted runs write nothing either.
- **Each entry says where and what**: the doc path, the routes it backs, the section heading it happened under, the code language if it was inside a fence, a one-line summary, and a diff excerpt.
- **Three dated entries are kept.** Counted, not aged — three headings are retained however far apart the dates fall, so a change from six weeks ago still shows if nothing has happened since. When a change lands on a fourth date, the oldest date is dropped whole.
- **Several syncs on one date share that date's entry**, newest first, so a day spent pressing the button cannot evict the two older dates.

Commit it along with the rest of `doc-snapshot/` — together with `git log -p doc-snapshot/`, that gives you a permanent history behind the rolling three-entry window.

---

## 8. Testing checklist / current status

| Doc page | Route | Status | Notes |
|---|---|---|---|
| `/langgraph-python` | `/` | 📖 Reference | Orientation + transport readout. |
| `/langgraph-python/quickstart?agent=bring-your-own` | `/quickstart` | ✅ Working | Both deployment tabs implemented. |
| `/langgraph-python/prebuilt-components/chat` | `/prebuilt-components/chat` | ✅ Working | |
| `/langgraph-python/prebuilt-components/sidebar` | `/prebuilt-components/sidebar` | ✅ Working | |
| `/langgraph-python/prebuilt-components/popup` | `/prebuilt-components/popup` | ✅ Working | |
| `/langgraph-python/prebuilt-components/chat-controls` | `/prebuilt-components/chat-controls` | ✅ Working | |
| `/langgraph-python/custom-look-and-feel/css` | `/custom-look-and-feel/css` | ✅ Working | v2 tokens; the page's `--copilot-kit-*` set is v1 and inert here. |
| `/langgraph-python/custom-look-and-feel/slots` | `/custom-look-and-feel/slots` | ✅ Working | |
| `/langgraph-python/custom-look-and-feel/headless-ui` | `/custom-look-and-feel/headless-ui` | ✅ Working | Minimal example; the "complete" one is on Programmatic Control. |
| `/langgraph-python/custom-look-and-feel/reasoning-messages` | `/custom-look-and-feel/reasoning-messages` | ⚠️ Partial | Needs a reasoning model, which no doc page enables. This repo does. |
| `/langgraph-python/multimodal-attachments` | `/multimodal-attachments` | ❌ Broken | **Blocked upstream.** `ag-ui-langgraph` 0.0.42 injects a `metadata` key into every media content block; OpenAI 400s. Every attachment fails. See §9 item 2. |
| `/langgraph-python/voice` | `/voice` | ⚠️ Partial | Mic needs `OPENAI_API_KEY` on the frontend; sample-audio button works without. |
| `/langgraph-python/generative-ui/reasoning` | `/generative-ui/reasoning` | ⚠️ Partial | Same reasoning-model dependency. |
| `/langgraph-python/generative-ui/tool-based` | `/generative-ui/tool-based` | ✅ Working | |
| `/langgraph-python/generative-ui/tool-rendering` | `/generative-ui/tool-rendering` | ⚠️ Partial | `get_weather` only — the page defines no other backend tool, but its prompt advertises three more. |
| `/langgraph-python/generative-ui/state-rendering` | `/generative-ui/state-rendering` | ✅ Working | Shares the streaming graph, as the docs do. |
| `/langgraph-python/generative-ui/a2ui/dynamic-schema` | `/generative-ui/a2ui/dynamic-schema` | ⚠️ Partial | Catalog is the doc's; leaf UI primitives are this repo's. |
| `/langgraph-python/generative-ui/a2ui/fixed-schema` | `/generative-ui/a2ui/fixed-schema` | ⚠️ Partial | Book button inert — Python SDK has no `action_handlers`. Schema JSON is this repo's. |
| `/langgraph-python/frontend-tools` | `/frontend-tools` | ✅ Working | |
| `/langgraph-python/human-in-the-loop` | `/human-in-the-loop` | ✅ Working | |
| `/langgraph-python/human-in-the-loop/interrupt-flow` | `/human-in-the-loop/interrupt-flow` | ⚠️ Partial | Two tabs. **Single interrupt** works. **Multiple interrupts** reproduces the page's `enabled` predicate verbatim and never fires. See §9 item 1. |
| `/langgraph-python/programmatic-control` | `/programmatic-control` | ⚠️ Partial | Renders nothing, faithfully — the published snippet ends after the handlers and never shows the JSX. Also destructures three undefined helpers. See §9 item 19. |
| `/langgraph-python/shared-state` | `/shared-state` | ⚠️ Partial | The page never defines the `set_notes` tool or `PreferencesInjectorMiddleware` it references. Both written here from its prose. See §9 item 15. |
| `/langgraph-python/shared-state/rendering-in-app` | `/shared-state/rendering-in-app` | ✅ Working | |
| `/langgraph-python/shared-state/streaming` | `/shared-state/streaming` | ✅ Working | |
| `/langgraph-python/shared-state/agent-readonly` | `/shared-state/agent-readonly` | ✅ Working | |
| `/langgraph-python/shared-state/in-app-agent-read` | `/shared-state/in-app-agent-read` | ✅ Working | The page's custom `chat_node` graph; only its elided node body was filled in. See §9 item 18. |
| `/langgraph-python/shared-state/in-app-agent-write` | `/shared-state/in-app-agent-write` | ✅ Working | |
| `/langgraph-python/shared-state/state-inputs-outputs` | `/shared-state/state-inputs-outputs` | ✅ Working | Uses the page's deprecated `input=`/`output=` keywords — doc-verbatim. |
| `/langgraph-python/shared-state/predictive-state-updates` | `/shared-state/predictive-state-updates` | ✅ Working | All three variants live: manual emission, tool emission, prebuilt. |
| `/langgraph-python/multi-agent/subagents` | `/multi-agent/subagents` | ⚠️ Partial | The page never prints the supervisor; that `create_agent` call is this repo's. |
| `/langgraph-python/agent-config` | `/agent-config` | ✅ Working | `build_system_prompt` wording is this repo's. |
| `/langgraph-python/agent-app-context` | `/agent-app-context` | ✅ Working | |
| `/langgraph-python/configurable` | `/configurable` | ⚠️ Partial | Works, and disproves the page's filtering claim. Uses the page's deprecated `config_schema=` — doc-verbatim. |
| `/langgraph-python/subgraphs` | `/subgraphs` | ⚠️ Partial | The page prints no agent code at all; the graph is this repo's. |
| — (tooling, not a doc page) | `/doc-sync` | ✅ Working | Fetches all 35 tracked doc pages and diffs them against `doc-snapshot/`. Verified: 35-page baseline in ~4s; code/heading/prose edits classify High/Medium/Low. |

**Legend:** ✅ Working · ⚠️ Partial · ❌ Broken · 📖 Reference · 🚧 Not started

> **Caveat on "Working":** every route typechecks, lints, builds and renders, and the agent server boots with all 35 graphs mounted. Individual agent *behaviours* — particularly the two A2UI routes and the two reasoning routes, which depend on model cooperation — have not each been driven end-to-end against a live OpenAI key.

---

## 9. Known issues / doc-vs-implementation discrepancies

Found against `@copilotkit/react-core` 1.66.2, `@copilotkit/runtime` 1.66.2, `copilotkit` 0.1.94, `ag-ui-langgraph` 0.0.42 and `langgraph` 1.2.10.

**Reproduction policy:** where the docs' published code is wrong, this repo *keeps it wrong* and documents the mismatch. A silently corrected snippet would hide the defect this harness exists to surface. Suppressions (`@ts-expect-error`, `eslint-disable`) are used where a doc bug would otherwise break the build for every other route; the doc expression itself is never edited.

**Open gap — `/programmatic-control/demo-chat` is missing that suppression.** It reproduces the Programmatic Control page's undefined `useAgent` / `useCopilotKit` hooks verbatim, which is correct per the policy above, but nothing insulates the rest of the repo from it:

```
src/app/programmatic-control/demo-chat/page.tsx(27,21): error TS2304: Cannot find name 'useAgent'.
src/app/programmatic-control/demo-chat/page.tsx(28,26): error TS2552: Cannot find name 'useCopilotKit'.
src/app/programmatic-control/demo-chat/page.tsx(71,17): error TS7006: Parameter 'err' implicitly has an 'any' type.
```

So `npm run typecheck` fails, and `next build` dies at `ReferenceError: useAgent is not defined` while prerendering that route — taking the whole build with it. This predates the doc-sync work and is unrelated to it. Fixing it means either adding suppressions plus `export const dynamic = "force-dynamic"` to keep it out of prerendering, or accepting that this repo has no green build until the doc page is corrected upstream. Deliberately left as-is, since choosing between those is a policy call.

### Things the docs get wrong

**1. `useInterrupt`'s `enabled` predicate does not compile — and throws at runtime**

[The interrupts page](https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/interrupt-flow) publishes `enabled: ({ eventValue }) => eventValue.type === 'ask'`. The predicate is declared `(event: InterruptEvent<TValue>) => boolean`, and `InterruptEvent` is `{ name, value }` — there is no `eventValue` field:

```
error TS2339: Property 'eventValue' does not exist on type 'InterruptEvent<any>'.
```

Destructuring a non-existent field yields `undefined`, so both predicates evaluate falsy and neither card ever mounts — the graph still interrupts and the browser still receives the `on_interrupt` event, so the run simply stalls with nothing on screen and no error. Reproduced verbatim with `@ts-expect-error` on the two lines. The route splits into two tabs so the working single-interrupt example (the page's main walkthrough) stays exercisable alongside it. The correct field is `value`.

**2. Every image attachment fails with a 400 (`ag-ui-langgraph` 0.0.42)**

Sending any attachment on this integration kills the run:

```
openai.BadRequestError: Error code: 400 - Invalid chat format.
Unexpected keys in a message content image dict.
```

The cause is upstream, in `ag_ui_langgraph/utils.py`:

```python
def _attach_input_metadata(content_block, item):
    metadata = getattr(item, "metadata", None)
    if metadata is not None:
        content_block["metadata"] = metadata   # OpenAI rejects unknown keys
    return content_block
```

Every media block therefore reaches OpenAI as `{type, image_url, metadata}`, and the
chat-completions API rejects unknown keys inside a content part. Verified against the
installed package: the identical conversion without metadata yields a valid
`{type, image_url}` block.

This is not an edge case — the [Multimodal Attachments page](https://docs.copilotkit.ai/langgraph-python/multimodal-attachments)
states "the filename is always included in metadata automatically", so *every* attachment
the composer sends carries metadata and fails. Left unpatched so the harness reports the
real state of the integration; a `wrap_model_call` middleware stripping the key is the
obvious workaround if you need attachments today.

**3. The `configurable` schema does not filter anything**

[The Configurable page](https://docs.copilotkit.ai/langgraph-python/configurable) claims "any item passed to 'configurables' which is not included in the schema, will be filtered out". Verified false on LangGraph 1.2.10: forwarding a key absent from `ConfigSchema` leaves it fully readable in `config['configurable']`. The `/configurable` route forwards one declared and one undeclared key side by side to demonstrate it. Do not rely on the schema to strip anything security-relevant.

**4. Two deprecated LangGraph constructor keywords**

`StateGraph(OverallState, input=…, output=…)` on [Input/Output Schemas](https://docs.copilotkit.ai/langgraph-python/shared-state/state-inputs-outputs) and `StateGraph(AgentState, config_schema=…)` on Configurable both warn:

```
LangGraphDeprecatedSinceV05: `input` is deprecated … Please use `input_schema` instead.
LangGraphDeprecatedSinceV10: `config_schema` is deprecated … Please use `context_schema` instead.
```

Kept as published. Note that Python suppresses `DeprecationWarning` outside `__main__` by default, so these are **silent** on a normal boot — run the backend with `python -W default::DeprecationWarning main.py` to see them. They work today and will break on LangGraph 2.

**5. `~20 snippets specify a model OpenAI does not publish**

Almost every Python snippet builds on `ChatOpenAI(model="gpt-5.4")` — a placeholder from CopilotKit's internal showcase repo. Those snippets cannot run as printed. The only model the docs commit to is the Quickstart's `gpt-4.1-mini`, which is what every graph here uses. The two reasoning routes use `o4-mini`, which the reasoning pages *do* name.

**6. The page's ref write during render**

Programmatic Control's `useHeadlessInterrupt` assigns `pendingRef.current = pending` in the component body. React's lint rule rejects this (`react-hooks/refs` — "Cannot update ref during render"). Reproduced verbatim with an `eslint-disable-next-line`.

**7. `useHumanInTheLoop` does not infer its argument type**

Unlike `useRenderTool`, it defaults to `Record<string, unknown>`, so `args.topic` is `unknown` and unusable in JSX. The docs sidestep this by typing the render props `any`, which discards checking across the whole render function. This repo supplies the generic explicitly instead.

**8. Slot casts are load-bearing, and the docs do not say why**

The Slots page casts every override `as unknown as typeof CopilotChatView.WelcomeScreen`. That reads like noise but is required: a slot whose default carries namespace statics is typed `SlotValue<typeof TheDefault>`, and `typeof CopilotChatAssistantMessage` includes all eight of its statics, so a plain function component is never assignable. `welcomeScreen` is the exception — typed `SlotValue<React.FC<WelcomeScreenProps>>`, it takes a component directly. Also note there is no `CopilotChatView.AssistantMessage`; the export is top-level `CopilotChatAssistantMessage`.

**9. `CopilotChat`'s `onError` collides with the DOM handler**

`CopilotChatProps` inherits the div's `onError` alongside its own, so the prop's type is an *intersection*. A handler typed only for the CopilotKit event will not assign; it must accept `SyntheticEvent` too and narrow.

**10. The CSS page documents two token systems, only one of which works here**

The `--copilot-kit-*` variables and the `CopilotKitCSSProperties` helper imported from `@copilotkit/react-ui` are **v1**. Against the v2 components this repo renders, setting them changes nothing — silently. The v2 shadcn tokens on `[data-copilotkit]` are the half that works.

**11. The Quickstart's install line includes a package nothing imports**

`@copilotkit/react-ui` is v1 and nothing on that page imports from it. Not a dependency here. The provider snippet also imports `CopilotKit` — that is the v1 compatibility wrapper; a v2 app root wants `CopilotKitProvider`.

### Things the docs reference but never define

**12. The Sub-Agents supervisor**

[The page](https://docs.copilotkit.ai/langgraph-python/multi-agent/subagents) prints the three sub-agents, the `Delegation` shape, the `operator.add` reducer, `_invoke_sub_agent`, `_delegation_update` and all three delegation tools — then stops. The `create_agent` call tying them together appears nowhere. Written here to the shape the page describes in prose.

It also imports `HeaderForwardingMiddleware` from `src.agents._header_forwarding_middleware`, a module no page shows. Its own comment explains it propagates `x-aimock-context` headers so CopilotKit's recorded-fixture test harness keeps matching — CI infrastructure, not part of the pattern. Dropped rather than reconstructed.

**13. Three of Tool Rendering's four backend tools**

The page wires renderers for `get_weather`, `search_flights`, `get_stock_price` and `roll_d20`, and defines only `get_weather`. The other three are not invented here. Its `SYSTEM_PROMPT` is reproduced verbatim and still advertises all four, so asking for a flight or a stock price produces prose rather than a tool call — the faithful consequence.

**14. Both A2UI schema files**

`flight_schema.json` and `booked_schema.json` are loaded by the printed code and shown on no page. Both are this repo's, written to the component tree the fixed-schema page diagrams.

**15. Both A2UI catalogs import primitives from an unshown directory**

`renderers.tsx` on both pages imports `Card`, `Badge`, `Button`, `Separator`, `CardShell`, `CHART_COLORS` and a colour constant `c` from a sibling `_components/`. Rebuilt in `frontend/src/app/generative-ui/a2ui/_components/primitives.tsx` — the only invented UI in either A2UI route.

**16. `set_notes` and `PreferencesInjectorMiddleware`**

[Shared State](https://docs.copilotkit.ai/langgraph-python/shared-state) publishes its `create_agent` literal in full, referencing both. Neither definition appears anywhere. Written here to what the page describes in prose and in its own system prompt.

**17. `build_system_prompt`**

[Agent Config](https://docs.copilotkit.ai/langgraph-python/agent-config)'s node calls it every turn and prints `read_config_value` in full, but never the function that turns three fields into directives. Its wording here is this repo's; only its job is the page's.

**18. The in-app read/write pages elide their node body**

Both pages publish the same `agent.py` — `class AgentState(CopilotKitState)` with a
`language` slot, and a `chat_node` that reads it back with
`state.get("language", "english")`. Both are reproduced verbatim, on the page's own
`StateGraph` shape rather than `create_agent`.

What the page elides is the node body itself:
`# ... add the rest of the node implementation and use the language variable` and
`# ... add the rest of state to return`. Filling those in took exactly three
additions: a model call whose system message names `language`, `messages` in the
returned dict beside `language`, and the `StateGraph` wiring the page never shows.

Worth confirming rather than assuming: the page's comment that "a default value in a
state class is not read on runtime" is correct. `CopilotKitState` is a `TypedDict`, so
the `= "english"` in the class body is inert — it neither seeds the state nor errors,
and the key is simply absent on the first turn. The in-node fallback is what supplies
the default.

There is deliberately **no `set_language` tool**. An earlier revision invented one so
the agent could change the language itself; neither page defines such a tool and
neither needs it, so it was removed. Language moves only from the UI via
`agent.setState`, which is what the pages demonstrate.

**19. Programmatic Control's `headless-complete` snippet has no render half**

The page walks through the component and builds a complete send pipeline —
`consumeAttachments` → `buildContent` → `agent.addMessage` → `copilotkit.runAgent`,
plus stop and reset handlers — and then simply ends. There is no JSX, no message
list and no composer anywhere on the page.

Reproduced as published, that component can only `return <></>`, so
`/programmatic-control` renders an empty frame. Nothing is missing from the
transcription; the render half was never written. Completing it would mean
inventing the part of the page that does not exist.

The same snippet also opens by destructuring three helpers it never defines.
`useAttachmentsConfig` has a real counterpart (`useAttachments`, which is exported
and already returns every field destructured, `consumeAttachments` included);
`useAutoScroll` and `buildContent` appear in no page and no package, and are
reconstructed in `frontend/src/app/programmatic-control/headless-helpers.ts`.

The handlers themselves typecheck against the installed package, which is what makes
this worth recording rather than dismissing: the logic the page teaches is sound, it
just never shows where any of it is wired. The interrupt-resolution example further
down that page *is* printed in full and does work — it is the mechanism behind the
[Interrupts](https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/interrupt-flow)
route, driven from a button rather than `useInterrupt`.

**20. `useAgenticChatSuggestions()` and its siblings**

The CopilotChat, Reasoning and other pages call `useAgenticChatSuggestions()`, `useReasoningDefaultSuggestions()` and similar. None is exported by any package — they are local to CopilotKit's demo app and wrap `useConfigureSuggestions`, which *is* exported. Called directly here.

**21. The Subgraphs page publishes no agent code at all**

It links to the Feature Viewer and prints one four-line `useAgent` snippet. The parent graph, subgraph and state schema are entirely this repo's, built to demonstrate the single claim the page makes.

### Package-level

**22. `a2ui` is importable but not an attribute of `copilotkit`**

The fixed-schema page writes `from copilotkit import CopilotKitMiddleware, a2ui`. That works — but only via Python's submodule-import fallback. `a2ui` is not re-exported from `copilotkit/__init__.py`, so `import copilotkit; copilotkit.a2ui.render(...)` raises `AttributeError` until something has imported the submodule.

**23. `a2ui.render(...)` does not accept `action_handlers`**

The canonical fixed-schema pattern pairs a schema with action handlers so clicking Book swaps in `booked_schema.json`. `render(operations)` is the entire signature in 0.1.94. The schema is loaded and unused; the button is inert. The page admits this itself.

**24. `zod` must be 3.x, not 4.x**

`@copilotkit/a2ui-renderer` 1.66.2 depends on `zod ^3.25.75` and types `CatalogComponentDefinition.props` as a zod 3 `ZodObject`. With zod 4 both A2UI catalogs fail to typecheck. Zod 4 also triggers an `ERESOLVE` peer conflict via `@copilotkit/runtime` → `langchain` → `langsmith`. Pinning `zod ^3.25.76` fixes both, and is why `npm install` needs no `--legacy-peer-deps`.

**25. `openai` must match what `@copilotkit/voice` bundles**

It depends on `openai ^5.9.0`. Installing `openai ^6` gives you two copies and `new OpenAI(...)` no longer satisfies `TranscriptionServiceOpenAIConfig` — the `#private` brand differs. Pinned to `^5.9.0`.

**26. The Inspector must be exactly one per page**

`CopilotKitInspector` is bound to *one* provider's core and is a lit custom element. Two on a page spin `lit-html` into an unbounded assert loop that Next mirrors to the dev server — enough to hang the tab and the machine. One attached to the wrong provider shows a permanently empty event list, indistinguishable from a broken one. `frontend/src/lib/inspector.ts` owns that decision: the root provider stands down on the three routes that mount their own `<CopilotKit>` (Voice, both A2UI). Add any new nested provider to its list.

---

## 10. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Every chat errors immediately | Agent server not running, or `OPENAI_API_KEY` missing from **its** environment | The key belongs to the Python process. `curl localhost:8123/health` to check. |
| Connection refused / hangs | `localhost` resolution | The docs' own note: try `0.0.0.0` or `127.0.0.1` in `LANGGRAPH_DEPLOYMENT_URL`. |
| One route errors, others fine | That graph id is not mounted | Open `/status` — it cross-checks both lists and names the drift. |
| Everything 404s from the runtime | Transport mismatch | `LANGGRAPH_TRANSPORT` must be identical in `backend/.env` and `frontend/.env.local`. FastAPI routes by URL path, LangSmith by `graphId`. |
| `langgraph dev` rejects a graph | Checkpointer compiled in | LangGraph Platform owns persistence. `_shared.checkpointer()` returns `None` under the `langsmith` transport — make sure it is set. |
| Interrupts never resume | No checkpointer | `interrupt()` cannot resume without one. Under FastAPI that is `MemorySaver`; under LangSmith the platform's. |
| A node's side effect happens twice | Node re-runs on resume | Everything above an `interrupt()` call executes again. Move non-idempotent work below it. |
| Tool runs but custom UI never renders | Renderer name ≠ tool name | `useRenderTool({ name })` must equal the Python function name exactly. |
| No tool calls visible at all | No wildcard renderer | Without `useDefaultRenderTool()` there is no `*` renderer and calls are invisible. |
| Frontend tool never called | `CopilotKitMiddleware` missing from `middleware=` | That is what forwards frontend tool definitions to the model each turn. |
| State streams in one burst at the end | `state_key` ≠ the tool's argument name | `usePredictStateSubscription` indexes partial args by `state_key`; they must match exactly. |
| UI toggle appears to do nothing | `setState` does not run the agent | Send a message, or call `runAgent()` yourself. |
| `thread is already processing` | `runAgent` called in a component body | Use a `useEffect` with an empty dep array, or an event handler. |
| Shared state resets on restart | `MemorySaver` | In-memory by design. Swap in a real checkpointer to persist. |
| Reasoning card never appears | Model did not deliberate, or is not a reasoning model | Only `o4-mini` here emits reasoning tokens, and only for prompts that need working out. |
| No mic button on `/voice` | Runtime has no `transcriptionService`, or `basePath` ≠ route directory | Both are required for `/info` to advertise `audioFileTranscriptionEnabled`. |
| Mic returns an error | No `OPENAI_API_KEY` on the **frontend** | Transcription is a separate Whisper call. Use the sample-audio button instead. |
| A2UI surface renders as raw JSON | `catalogId` mismatch, or middleware not attached | The backend's `createSurface.catalogId` must equal the frontend `createCatalog` id. |
| **Browser tab or dev server hangs on a route** | **Two inspectors mounted on one page** | Only one provider per page may enable it. See §9 item 25. |
| `npm install` ERESOLVE on zod | `zod` bumped to 4 | See §9 item 23. Stay on `^3.25.76`. |
| Attachment sends → 400 `Unexpected keys in a message content image dict` | `ag-ui-langgraph` 0.0.42 adds `metadata` to media content blocks | Upstream bug, deliberately unpatched. See §9 item 2. |
| Want to see the deprecation warnings | Python hides `DeprecationWarning` by default | `python -W default::DeprecationWarning main.py`. Expected — see §9 item 3. |

---

## 11. Project structure

```
langgraph-python/
├── CLAUDE.md
├── README.md
├── .env.example                      # annotated, split by which process reads what
│
├── backend/                          # Python — a genuinely separate process
│   ├── pyproject.toml                # the Quickstart's install line
│   ├── main.py                       # ★ FastAPI transport: one AG-UI endpoint per graph
│   ├── langgraph.json                # ★ LangSmith transport — generated from registry.py
│   └── src/graphs/
│       ├── registry.py               # ★ id → graph; id is also mount path AND graphId
│       ├── _shared.py                # ★ MODEL, REASONING_MODEL, transport checkpointer
│       ├── quickstart.py             # verbatim from the Quickstart
│       ├── chat.py                   # the frontend-only routes' graphs (one factory)
│       ├── tool_rendering.py
│       ├── shared_state_read_write.py
│       ├── shared_state_streaming.py
│       ├── shared_state_language.py
│       ├── readonly_state_agent_context.py
│       ├── state_inputs_outputs.py
│       ├── predictive_state_manual_emission.py # copilotkit_emit_state
│       ├── predictive_state_tool_emission.py   # copilotkit_customize_config
│       ├── predictive_state_prebuilt.py       # StateStreamingMiddleware
│       ├── interrupt_flow.py         # native interrupt()
│       ├── interrupt_headless.py
│       ├── subagents.py
│       ├── subgraphs.py
│       ├── agent_config.py
│       ├── agent_app_context.py
│       ├── configurable.py
│       ├── a2ui_fixed.py
│       ├── declarative_gen_ui.py
│       └── a2ui_schemas/             # flight_schema.json · booked_schema.json
│
├── doc-snapshot/                     # ★ the doc-drift baseline — committed
│   ├── manifest.json                 # ★ per-page sha256; the diff basis
│   ├── CHANGELOG.md                  # ★ what changed and where — survives re-syncs
│   ├── pages/                        # 35 markdown files, one per tracked doc page
│   └── reports/                      # gitignored — last 10 runs + latest.json
│
└── frontend/
    └── src/
        ├── app/
        │   ├── layout.tsx
        │   ├── page.tsx                     # / — orientation, transport readout, sync button
        │   ├── status/page.tsx              # live registry cross-check
        │   ├── doc-sync/page.tsx            # ★ the drift report
        │   ├── api/
        │   │   ├── copilotkit/route.ts                    # ★ main runtime, 35 graphs
        │   │   ├── copilotkit-voice/[[...slug]]/route.ts  # ★ v2 runtime + transcription
        │   │   └── copilotkit-declarative-gen-ui/route.ts # ★ A2UI auto-inject
        │   └── <doc route>/
        │       ├── page.tsx                 # notes + exact source (server component)
        │       └── demo-chat/page.tsx       # ★ the running feature, chrome-free
        ├── components/
        │   ├── providers.tsx                # ★ the one app-wide provider
        │   ├── doc-sync-button.tsx          # the sync trigger (client)
        │   ├── doc-drift-panel.tsx          # landing-page summary — self-contained
        │   ├── doc-synced-at.tsx            # the single sync date, read from the manifest
        │   ├── doc-diff.tsx                 # severity badge, check marks, hunk rendering
        │   ├── source-code.tsx              # renders a repo file verbatim
        │   ├── code-figure.tsx              # shared Shiki code block
        │   ├── app-chrome.tsx               # sidebar layout, skipped on /demo-chat
        │   ├── demo-frame.tsx
        │   ├── nav-sidebar.tsx
        │   ├── route-header.tsx
        │   └── ui.tsx                       # Panel, Callout, TryIt, KeyValue
        └── lib/
            ├── nav-config.ts                # ★ routes, docs, status — one source
            ├── agents.ts                    # ★ agent ids + transport switch
            ├── runtime-agents.ts            # ★ builds LangGraphAgent vs LangGraphHttpAgent
            ├── inspector.ts                 # which provider owns the Inspector
            ├── source.ts                    # server-only file reader + repo-root guard
            ├── highlight.ts                 # server-only Shiki wrapper
            └── doc-sync/                    # ★ portable — zero repo-specific code
                ├── types.ts                 # shared shapes (safe on the client)
                ├── paths.ts                 # nav routes → unique doc URLs
                ├── fetch-docs.ts            # pool, timeouts, markdown validation
                ├── diff.ts                  # fence annotator, LCS, severity
                ├── changelog.ts             # CHANGELOG.md rendering + 3-entry rotation
                ├── store.ts                 # snapshot fs + write guard
                └── actions.ts               # the "use server" entry point
```

### Porting `/doc-sync` to the other framework repos

`src/lib/doc-sync/` derives everything from `DOCS_ROOT` and `NAV` in `nav-config.ts`, so it contains no framework-specific code and there are **no dependencies to install** — the line differ is hand-rolled precisely so the port stays a file copy.

1. Copy `src/lib/doc-sync/` (7 files), the four `src/components/doc-*.tsx` files, and `src/app/doc-sync/page.tsx`.
2. In `src/lib/source.ts`, export `REPO_ROOT` and rename the private `resolveRepoPath` to an exported `resolveInRepo` (the doc-sync store reuses both, so the repo root and its traversal guard stay defined once).
3. Add a `/doc-sync` entry to `NAV`.
4. Add `export const dynamic = "force-dynamic"` and `<DocDriftPanel />` to `src/app/page.tsx`. The panel reads the snapshot itself, so no other restructuring is needed — an async server component renders fine inside a synchronous parent.
5. Delete `DOC_SYNC_DATE` from `nav-config.ts` and swap its readouts on `/` and `/status` for `<DocSyncedAt />`. It substitutes in either place the constant was used — a `KeyValue` row or mid-sentence in prose — so each repo keeps a single, machine-written sync date.
6. Add `doc-snapshot/reports/` to `.gitignore`.
7. Press the button once to create the baseline, then commit `doc-snapshot/`.
8. Prune `manifest.json`'s `knownUnmapped` by hand as you build routes for pages it lists.

### Why it is built this way

A few choices look arbitrary until they bite:

- **The snapshot lives at the repo root, not under `frontend/`.** `frontend/package-lock.json` is the only lockfile, so that is where the dev server roots its watcher — writing 35 files inside it on every sync would recompile the page that triggered the sync.
- **Changes are detected by SHA-256, not by the differ.** The line diff is presentation only, which is what makes a hand-rolled differ safe: it can render an ugly hunk, but it can never miss a change.
- **The comparison basis is the stored file, not the hash recorded beside it.** `manifest.json` records what was written; it is not evidence of what is on disk now. Trusting it would make a snapshot edited or corrupted locally invisible — its recorded hash still matches upstream, so the page reads as unchanged and the next write quietly restores it. Reading the 35 bodies back costs nothing locally and makes the snapshot answer for its actual contents.
- **Every response is checked for `text/markdown`.** The `.md` endpoint is undocumented, and a URL that misses it still answers `200` with the HTML app shell. Writing that in would destroy the baseline and report the whole corpus as rewritten next run. A failure aborts and writes nothing.
- **A run commits all pages or none.** A partial snapshot makes the *next* run's diff silently wrong about whichever pages were skipped.
- **The sitemap's `lastmod` is deliberately ignored.** It looks exactly like the change signal this feature needs, but 3505 of the sitemap's 3543 entries carry an identical timestamp — it is the site's build stamp, not a per-page modification time.
- **Changed pages get re-fetched once before being committed.** Responses are cached for 60s with no ETag, so a deploy landing mid-run can serve a mix of builds. A page whose two reads disagree is reported as `unstable` and held back.

---

## 12. References

**Getting Started** — [Quickstart (bring your own agent)](https://docs.copilotkit.ai/langgraph-python/quickstart?agent=bring-your-own)

**Prebuilt Components** — [CopilotChat](https://docs.copilotkit.ai/langgraph-python/prebuilt-components/chat) · [CopilotSidebar](https://docs.copilotkit.ai/langgraph-python/prebuilt-components/sidebar) · [CopilotPopup](https://docs.copilotkit.ai/langgraph-python/prebuilt-components/popup) · [Open, close, and feedback](https://docs.copilotkit.ai/langgraph-python/prebuilt-components/chat-controls)

**Custom Look and Feel** — [CSS](https://docs.copilotkit.ai/langgraph-python/custom-look-and-feel/css) · [Slots](https://docs.copilotkit.ai/langgraph-python/custom-look-and-feel/slots) · [Headless UI](https://docs.copilotkit.ai/langgraph-python/custom-look-and-feel/headless-ui) · [Reasoning Messages](https://docs.copilotkit.ai/langgraph-python/custom-look-and-feel/reasoning-messages)

**Input Modalities** — [Multimodal Attachments](https://docs.copilotkit.ai/langgraph-python/multimodal-attachments) · [Voice](https://docs.copilotkit.ai/langgraph-python/voice)

**Generative UI** — [Reasoning](https://docs.copilotkit.ai/langgraph-python/generative-ui/reasoning) · [Components as Tools](https://docs.copilotkit.ai/langgraph-python/generative-ui/tool-based) · [Tool Rendering](https://docs.copilotkit.ai/langgraph-python/generative-ui/tool-rendering) · [State Rendering](https://docs.copilotkit.ai/langgraph-python/generative-ui/state-rendering) · [A2UI Dynamic Schema](https://docs.copilotkit.ai/langgraph-python/generative-ui/a2ui/dynamic-schema) · [A2UI Fixed Schema](https://docs.copilotkit.ai/langgraph-python/generative-ui/a2ui/fixed-schema)

**App Control** — [Frontend Tools](https://docs.copilotkit.ai/langgraph-python/frontend-tools) · [Human in the Loop](https://docs.copilotkit.ai/langgraph-python/human-in-the-loop) · [Interrupts](https://docs.copilotkit.ai/langgraph-python/human-in-the-loop/interrupt-flow) · [Programmatic Control](https://docs.copilotkit.ai/langgraph-python/programmatic-control)

**Shared State** — [Overview](https://docs.copilotkit.ai/langgraph-python/shared-state) · [Render state in your app](https://docs.copilotkit.ai/langgraph-python/shared-state/rendering-in-app) · [State Streaming](https://docs.copilotkit.ai/langgraph-python/shared-state/streaming) · [Agent Read-Only Context](https://docs.copilotkit.ai/langgraph-python/shared-state/agent-readonly) · [Reading agent state](https://docs.copilotkit.ai/langgraph-python/shared-state/in-app-agent-read) · [Writing agent state](https://docs.copilotkit.ai/langgraph-python/shared-state/in-app-agent-write) · [Input/Output Schemas](https://docs.copilotkit.ai/langgraph-python/shared-state/state-inputs-outputs) · [Predictive state updates](https://docs.copilotkit.ai/langgraph-python/shared-state/predictive-state-updates)

**Multi-Agent** — [Sub-Agents](https://docs.copilotkit.ai/langgraph-python/multi-agent/subagents)

**LangGraph Runtime** — [Agent Config](https://docs.copilotkit.ai/langgraph-python/agent-config) · [Readables](https://docs.copilotkit.ai/langgraph-python/agent-app-context) · [Configurable](https://docs.copilotkit.ai/langgraph-python/configurable) · [Subgraphs](https://docs.copilotkit.ai/langgraph-python/subgraphs)

**External** — [LangGraph docs](https://docs.langchain.com/oss/python/langgraph/overview) · [`copilotkit` on PyPI](https://pypi.org/project/copilotkit/) · [`ag-ui-langgraph` on PyPI](https://pypi.org/project/ag-ui-langgraph/) · [AG-UI protocol](https://ag-ui.com) · [A2UI Composer](https://a2ui-composer.ag-ui.com/)
