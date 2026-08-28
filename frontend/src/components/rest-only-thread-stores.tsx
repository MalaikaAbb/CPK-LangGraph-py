"use client";

/**
 * Caps realtime thread subscriptions at one agent instead of one per agent.
 *
 * WHY THIS EXISTS
 *
 * The Inspector keeps its own thread store for every agent it can see:
 *
 *     private processAgentsChanged(agents) {
 *       for (const agent of Object.values(agents))
 *         this.ensureOwnedThreadStore(agent.agentId);
 *     }
 *
 * Each store that is given a `wsUrl` opens its own Phoenix WebSocket, so this
 * harness's 35 registered agents produce 35 of them. They are pure duplication:
 * the thread topic is `user_meta:<joinCode>`, and `joinCode` is per USER, not
 * per agent — every agent returns the identical value, so all 35 sockets carry
 * the same payload.
 *
 * That would merely be wasteful if the sockets survived, but they cannot. The
 * `join_token` from `POST /threads/subscribe` is single use (verified against
 * the platform: a fresh token upgrades 101, the same token replayed returns
 * 403). CopilotKit passes it as a frozen object:
 *
 *     params: { join_token: joinToken }
 *
 * and Phoenix's `endPointURL()` re-appends the socket's stored params on every
 * `connect()` — including its automatic reconnects, and including the
 * re-subscribes caused by `shareReplay({ refCount: true })` upstream. So a
 * socket that drops replays a spent token, gets 403 five times, and dies with
 * "WebSocket failed after 5 attempts, giving up". Nothing recovers it: there is
 * no `retry` anywhere in `@copilotkit/core`, so no layer ever refetches
 * credentials.
 *
 * The resulting retry storm saturates the main thread, and the agent run — which
 * joins its own channel through the strict `ɵjoinPhoenixChannel$` variant that
 * throws rather than logs — misses Phoenix's 10s join deadline and fails with
 * "Timed out joining channel". The run itself is healthy: measured in isolation
 * it joins in ~1.9s, well inside the budget.
 *
 * HOW THIS FIXES IT
 *
 * `ensureOwnedThreadStore` yields to a store that is already registered:
 *
 *     // Don't overwrite a store already registered by useThreads() or another
 *     // external caller
 *     if (this.core?.getThreadStore(agentId)) return;
 *
 * So we register a store for every agent first, built WITHOUT `wsUrl`. Those
 * stores fetch thread lists over REST and never open a socket — the effect that
 * requests realtime credentials gates on `Boolean(context.wsUrl)`. The Inspector
 * adopts them and still renders per-agent thread lists.
 *
 * `REALTIME_AGENT_ID` is deliberately skipped so `useThreads` on the Rich
 * Threads routes owns it and gets the real socket. Net: one WebSocket, not 35.
 *
 * COSTS, STATED PLAINLY
 *
 *   - `ɵcreateThreadStore` is internal API. It is not re-exported by
 *     `react-core`, so this imports from `@copilotkit/core` directly. Expect it
 *     to need revisiting on a version bump.
 *   - The other agents get no live thread updates. They never had working ones:
 *     the single-use-token bug breaks that path for every agent equally.
 *   - Registration costs one `GET /threads` per agent at startup. HTTP only —
 *     no `POST /threads/subscribe`, no socket, no retry storm.
 *
 * Delete this file once upstream passes `params` as a function and refetches
 * credentials on reconnect. See README §9.
 */

import { ɵcreateThreadStore, type ɵThreadStore } from "@copilotkit/core";
import { useCopilotKit } from "@copilotkit/react-core/v2";
import { useEffect } from "react";

/**
 * The one agent that keeps a real realtime subscription.
 *
 * All three Rich Threads routes bind to it, and `useThreads` registers its own
 * store there — which is why this component must not claim it.
 */
export const REALTIME_AGENT_ID = "sample_agent";

export function RestOnlyThreadStores() {
  const { copilotkit } = useCopilotKit();

  // Agents arrive from `/info` discovery after connect, so this reconciles on
  // every agent change rather than once on mount.
  useEffect(() => {
    const owned = new Map<string, ɵThreadStore>();

    const reconcile = () => {
      const { runtimeUrl } = copilotkit;
      if (!runtimeUrl) return;

      for (const agentId of Object.keys(copilotkit.agents ?? {})) {
        if (agentId === REALTIME_AGENT_ID) continue;
        if (owned.has(agentId)) continue;
        // Never displace a store someone else owns — `useThreads` on a mounted
        // route, or one the Inspector already built.
        if (copilotkit.getThreadStore(agentId)) continue;

        const store = ɵcreateThreadStore({ fetch: globalThis.fetch });
        store.start();
        // No `wsUrl`: this is what keeps the store on REST and off the socket.
        store.setContext({
          runtimeUrl,
          headers: { ...copilotkit.headers },
          agentId,
        });
        copilotkit.registerThreadStore(agentId, store);
        owned.set(agentId, store);
      }
    };

    reconcile();
    const subscription = copilotkit.subscribe({ onAgentsChanged: reconcile });

    return () => {
      subscription.unsubscribe();
      for (const [agentId, store] of owned) {
        // Only retract our own registration — another owner may have replaced
        // it while this was mounted.
        if (copilotkit.getThreadStore(agentId) === store) {
          copilotkit.unregisterThreadStore(agentId);
        }
        store.setContext(null);
        store.stop();
      }
      owned.clear();
    };
  }, [copilotkit]);

  return null;
}
