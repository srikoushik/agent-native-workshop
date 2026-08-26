import { defineAction } from "@agent-native/core/action";
import { z } from "zod";

import type { Greeting } from "../shared/api.js";

/**
 * The one example action in this skeleton. It is the whole agent-native
 * contract in miniature: the agent calls it as a tool, the CLI runs it as
 * `pnpm action hello --name Koushik`, and the home page loads it in its route
 * `loader`. Delete it once you have a real action.
 */
export default defineAction({
  description:
    "Return a welcome greeting. Example read-only action — replace with your app's first real action.",
  schema: z.object({
    name: z
      .string()
      .optional()
      .describe("Who to greet. Omit for the general welcome."),
  }),
  http: { method: "GET" },
  run: async ({ name }): Promise<Greeting> => {
    const who = name?.trim();
    return {
      message: who
        ? `Welcome to Agent Native, ${who}!`
        : "Welcome to Agent Native!",
      generatedAt: new Date().toISOString(),
    };
  },
});
