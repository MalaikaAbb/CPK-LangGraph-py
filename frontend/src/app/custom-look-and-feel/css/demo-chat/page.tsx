"use client";

import { CopilotChat } from "@copilotkit/react-core/v2";

import { DemoFrame } from "@/components/demo-frame";

// The page's own pattern: keep the theme in a sibling stylesheet and import it
// from the page module. Next bundles it with the route, and because every
// selector is scoped under `.chat-css-demo-scope` nothing leaks out.
import "../theme.css";

export default function Page() {
  return (
    <DemoFrame
      parentPath="/custom-look-and-feel/css"
      subtitle="graph: chat-customization-css"
    >
      <div className="chat-css-demo-scope h-full">
        <CopilotChat
          agentId="chat-customization-css"
          className="h-full"
          labels={{
            welcomeMessageText: "Hello! How can I help you today?",
            chatInputPlaceholder: "Ask me anything!",
          }}
        />
      </div>
    </DemoFrame>
  );
}
