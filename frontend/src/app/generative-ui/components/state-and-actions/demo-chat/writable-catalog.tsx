"use client";

// "Keep what the user types": the page prints the `CheckoutForm` entry and
// the component. The catalog around the entry is repo-authored scaffolding,
// named `shopUI` because the component's props type refers to it by that name.
import { z } from "zod";
import {
  createGenerativeUI,
  type GenerativeUIComponentProps,
} from "@copilotkit/react-core/v2/generative-ui";

function CheckoutForm({ email, setEmail }: GenerativeUIComponentProps<typeof shopUI, "CheckoutForm">) {
  return <input value={email ?? ""} onChange={(event) => setEmail(event.target.value)} />;
}

export const shopUI = createGenerativeUI({
  id: "acme/shop@1",
  components: {
    CheckoutForm: {
      component: CheckoutForm,
      props: z.object({ email: z.string().optional() }),
      writable: ["email"],
    },
  },
});
