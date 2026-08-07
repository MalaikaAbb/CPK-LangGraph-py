import { RouteHeader } from "@/components/route-header";
import { SourceCode } from "@/components/source-code";
import { Callout, Panel, TryIt } from "@/components/ui";

export default function Page() {
  return (
    <>
      <RouteHeader path="/multimodal-attachments" />

      <Panel title="What it demonstrates">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <code>attachments={"{{ enabled: true }}"}</code> and nothing else is
          the whole feature. Files are read to base64, packed as{" "}
          <code>InputContent</code> parts alongside the text, and handed to the
          agent over AG-UI — so the graph needs no attachment-specific code at
          all. What the extra config buys you is control over what gets rejected
          before it is sent, and visibility when the model refuses it after.
        </p>
        <div className="mt-4">
          <TryIt
            prompts={[
              "Attach a screenshot and ask: what's in this image?",
              "Then try attaching a .zip",
            ]}
            expect="The .zip is rejected client-side — an amber banner names it invalid-type. That half works."
            fail="The image attachment fails the run with a 400 from OpenAI. That is the current, expected outcome — see the blocker below."
          />
        </div>
      </Panel>

      <Callout
        tone="warn"
        title="Blocked upstream: every image attachment 400s"
      >
        <p>
          Sending any attachment on this integration fails the run with:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            openai.BadRequestError: Error code: 400 — Invalid chat format.
            Unexpected keys in a message content image dict.
          </code>
        </p>
        <p className="mt-2">
          The cause is in <code>ag-ui-langgraph</code> 0.0.42, not in this repo
          or in the doc page. Its{" "}
          <code>_attach_input_metadata()</code> helper copies the AG-UI content
          part&apos;s <code>metadata</code> onto the LangChain content block:
        </p>
        <p className="mt-2">
          <code className="text-xs">
            {
              'def _attach_input_metadata(content_block, item): … content_block["metadata"] = metadata'
            }
          </code>
        </p>
        <p className="mt-2">
          So the block handed to OpenAI carries{" "}
          <code>{'{ type, image_url, metadata }'}</code>, and the
          chat-completions API rejects unknown keys inside a content part.
          Verified directly against the installed package: the same conversion
          with no metadata produces a valid{" "}
          <code>{"{ type, image_url }"}</code> block.
        </p>
        <p className="mt-2">
          It is not an edge case. This page states that &ldquo;the filename is
          always included in metadata automatically&rdquo;, so{" "}
          <strong>every</strong> attachment the composer sends carries metadata
          and therefore fails. Left unpatched so the harness reports the real
          state of the integration.
        </p>
      </Callout>

      <Panel title="The demo">
        <SourceCode file="frontend/src/app/multimodal-attachments/demo-chat/page.tsx" />
      </Panel>

      <Panel title="Configuration">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2 pr-4 font-semibold">Option</th>
                <th className="py-2 pr-4 font-semibold">Default</th>
                <th className="py-2 font-semibold">What it does</th>
              </tr>
            </thead>
            <tbody className="text-slate-600 dark:text-slate-400">
              {[
                ["enabled", "—", "Turns attachments on in the composer."],
                [
                  "accept",
                  '"*/*"',
                  "MIME filter. Patterns like image/*, .pdf,.docx, or a comma-separated list.",
                ],
                ["maxSize", "20 MB", "Maximum file size in bytes."],
                [
                  "onUpload",
                  "base64 inline",
                  "Custom upload handler. Return { type: 'url' } to host the file yourself.",
                ],
                [
                  "onUploadFailed",
                  "—",
                  "Fires on invalid-type, file-too-large, or upload-failed.",
                ],
              ].map(([opt, def, desc]) => (
                <tr
                  key={opt}
                  className="border-b border-slate-100 dark:border-slate-900"
                >
                  <td className="py-2 pr-4 font-mono text-xs text-slate-900 dark:text-slate-100">
                    {opt}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">{def}</td>
                  <td className="py-2">{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          For production, swap the default base64 reader for an{" "}
          <code>onUpload</code> that puts the file in your own storage and
          returns <code>{"{ type: 'url', value }"}</code> — inlining a 10 MB
          video as base64 sends roughly 13 MB of JSON per turn. The filename is
          added to metadata automatically either way.
        </p>
      </Panel>

      <Callout tone="warn" title="onError collides with the DOM handler">
        <p>
          <code>CopilotChatProps</code> inherits the div&apos;s{" "}
          <code>onError</code> alongside its own, so the prop&apos;s type is an{" "}
          <em>intersection</em> of both. A handler typed only for the CopilotKit
          event will not assign — it has to accept a{" "}
          <code>SyntheticEvent</code> too and narrow before touching{" "}
          <code>event.error</code>. That is the reason for the slightly awkward
          signature in the demo above, and it is worth knowing because the error
          message TypeScript gives is not obvious.
        </p>
      </Callout>

      <Callout tone="info" title="Modality support is the model's business">
        <p>
          The runtime will happily forward an audio part to a model that has no
          idea what to do with it; you get a <code>RUN_ERROR</code> back. Images
          are broadly supported, audio and video much less so. The{" "}
          <code>onError</code> handler above is what turns that from a silent
          failure into a visible banner.
        </p>
      </Callout>
    </>
  );
}
