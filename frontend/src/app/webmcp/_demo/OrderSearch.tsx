"use client";

import { useFrontendTool } from "@copilotkit/react-core/v2";
import { z } from "zod";
import { searchOrders } from "./search-orders"; // Repo-authored stub: the page never defines searchOrders.

export function OrderSearch() {
  useFrontendTool({
    name: "searchOrders",
    description: "Search the signed-in user's orders by status",
    parameters: z.object({
      status: z.enum(["open", "shipped", "delivered"]),
    }),
    handler: async ({ status }) => {
      const orders = await searchOrders(status);
      return JSON.stringify(orders);
    },
    webmcp: {
      annotations: {
        readOnlyHint: true,
      },
    },
  });

  return null;
}
