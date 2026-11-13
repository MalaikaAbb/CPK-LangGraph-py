import {
  EventType,
  type BaseEvent,
  type Message,
  type MessagesSnapshotEvent,
  type ToolCall,
  type ToolCallResultEvent,
} from "@ag-ui/client";
import { InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { concatMap, of } from "rxjs";
import { randomUUID } from "node:crypto";

export class AgentCoreRunner extends InMemoryAgentRunner {
  private readonly knownThreadIds = new Set<string>();

  override run(request: Parameters<InMemoryAgentRunner["run"]>[0]) {
    if (request.threadId) this.knownThreadIds.add(request.threadId);
    return super.run(request);
  }

  override connect(request: Parameters<InMemoryAgentRunner["connect"]>[0]) {
if (!request.threadId || !this.knownThreadIds.has(request.threadId)) {
      const threadId = request.threadId ?? randomUUID();
      const runId = randomUUID();
      return of<BaseEvent>(
        { type: EventType.RUN_STARTED, threadId, runId },
        { type: EventType.MESSAGES_SNAPSHOT, messages: [] },
        { type: EventType.RUN_FINISHED, threadId, runId },
      );
    }

    return super.connect(request).pipe(
      concatMap((event: BaseEvent) => {
        if (event.type !== EventType.MESSAGES_SNAPSHOT) return of(event);
        const snapshot = event as MessagesSnapshotEvent;
        const replayedResults: ToolCallResultEvent[] = snapshot.messages.flatMap(
          (message: Message) => {
if (message.role !== "assistant" || !message.toolCalls?.length) return [];
            return message.toolCalls.map<ToolCallResultEvent>((toolCall: ToolCall) => ({
              type: EventType.TOOL_CALL_RESULT,
              toolCallId: toolCall.id,
              messageId: `${toolCall.id}-result`,
              content: "",
              role: "tool",
            }));
          },
        );
        return of<BaseEvent>(...replayedResults, snapshot);
      }),
    );
  }
}
