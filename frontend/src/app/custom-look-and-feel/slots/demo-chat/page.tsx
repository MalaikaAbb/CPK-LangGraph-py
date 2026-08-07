"use client";

import {
  CopilotChat,
  type CopilotChatAssistantMessage,
  type CopilotChatInput,
} from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

import {
  CustomAssistantMessage,
  CustomDisclaimer,
  CustomWelcomeScreen,
} from "../slot-overrides";

/**
 * The doc's `chat-slots` cell: three slots overridden on a single
 * `<CopilotChat>` — the welcome screen, the assistant message card, and the
 * input's disclaimer.
 *
 * The page extracts each into a local "so the override points are easy to see",
 * which is why they are named consts here rather than written inline.
 *
 * The page's snippet casts each override with
 * `X as unknown as typeof CopilotChatView.WelcomeScreen`, and that cast turns
 * out to be load-bearing rather than defensive. Slots whose default carries
 * namespace statics are typed as `SlotValue<typeof TheDefault>`, and
 * `typeof CopilotChatAssistantMessage` includes all eight of its statics
 * (`MarkdownRenderer`, `Toolbar`, `CopyButton`, …). A plain function component
 * is therefore never assignable, however correct its props:
 *
 *   Type '(props: …) => JSX.Element' is missing the following properties from
 *   type 'typeof CopilotChatAssistantMessage': MarkdownRenderer, Toolbar,
 *   ToolbarButton, CopyButton, and 4 more.
 *
 * So the cast is required for those slots. `welcomeScreen` is the exception —
 * it is typed `SlotValue<React.FC<WelcomeScreenProps>>`, a plain FC, and takes
 * the component directly. See README §9.
 */
export default function Page() {
  // No cast: welcomeScreen's slot type is a plain FC.
  const welcomeScreen = CustomWelcomeScreen;

  // Cast required: these slot types demand the default's namespace statics.
  const messageView = {
    assistantMessage:
      CustomAssistantMessage as unknown as typeof CopilotChatAssistantMessage,
  };
  const input = {
    disclaimer:
      CustomDisclaimer as unknown as typeof CopilotChatInput.Disclaimer,
  };

  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/slots"
      subtitle="graph: chat-slots"
    >
      <CopilotChat
        agentId="chat-slots"
        className="h-full"
        welcomeScreen={welcomeScreen}
        messageView={messageView}
        input={input}
      />
    </DemoFrame>
  );
}
