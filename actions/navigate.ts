import { defineAction } from "@agent-native/core/action";
import { writeAppState } from "@agent-native/core/application-state";
import { z } from "zod";

import { isDayKey } from "../shared/day.js";

/**
 * Moves the UI. Writes a one-shot `navigate` command to application state
 * which `useNavigationState()` reads, acts on, and deletes.
 */
export default defineAction({
  description:
    "Navigate the UI to a view, optionally to a specific day. The UI consumes the command and clears it.",
  schema: z.object({
    view: z.enum(["day"]).default("day").describe("View to navigate to"),
    date: z
      .string()
      .refine(isDayKey, "Expected a calendar date as YYYY-MM-DD")
      .optional()
      .describe(
        "Day the day view should show, as YYYY-MM-DD. Omit to show today. Resolve relative days like 'tomorrow' against the current date in your runtime context, not against a date read off the screen.",
      ),
  }),
  http: false,
  run: async ({ view, date }) => {
    await writeAppState("navigate", { view, date });
    return { navigated: view, date: date ?? null };
  },
});
