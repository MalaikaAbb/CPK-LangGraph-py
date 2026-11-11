import { CopilotKitCore } from "@copilotkit/core";
import { z } from "zod";
import { searchOrders } from "./search-orders"; // Repo-authored stub: the page never defines searchOrders.

export const copilotkit = new CopilotKitCore({
  tools: [
    {
      name: "searchOrders",
      description: "Search the signed-in user's orders by status",
      parameters: z.object({
        status: z.enum(["open", "shipped", "delivered"]),
      }),
      handler: async ({ status }) => {
        const orders = await searchOrders(status);
        return JSON.stringify(orders);
      },
      // @ts-expect-error `webmcp` ships in @copilotkit/core 1.71+; this repo is on 1.70.0, so it is an unknown property and ignored at runtime (README §9 item 37)
      webmcp: {
        annotations: {
          readOnlyHint: true,
        },
      },
    },
  ],
});
