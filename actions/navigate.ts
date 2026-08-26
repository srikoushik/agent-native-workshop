import { defineAction } from "@agent-native/core/action";
import { writeAppState } from "@agent-native/core/application-state";
import { z } from "zod";

/**
 * Moves the UI. Writes a one-shot `navigate` command to application state
 * which `useNavigationState()` reads, acts on, and deletes.
 */
export default defineAction({
  description:
    "Navigate the UI to a view. The UI consumes the command and clears it.",
  schema: z.object({
    view: z.enum(["home"]).describe("View to navigate to"),
  }),
  http: false,
  run: async ({ view }) => {
    await writeAppState("navigate", { view });
    return { navigated: view };
  },
});
