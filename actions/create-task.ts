import { defineAction } from "@agent-native/core/action";
import { getRequestOrgId } from "@agent-native/core/server/request-context";
import { nanoid } from "nanoid";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { tasks } from "../server/db/schema.js";
import { requireOwnerEmail } from "../server/lib/owner.js";
import type { Task } from "../shared/api.js";
import { isDayKey, isTimeOfDay } from "../shared/day.js";

/** Long enough for a real task, short enough to render in a slot. */
const MAX_TITLE_LENGTH = 200;

/**
 * Put a task on the calendar. The UI calls this when a slot is tapped; the
 * agent calls it as a tool. Same validation either way.
 */
export default defineAction({
  description:
    "Add a task to the calendar at a given day and time. Several tasks may share the same time.",
  schema: z.object({
    title: z
      .string()
      .trim()
      .min(1, "A task needs a title")
      .max(
        MAX_TITLE_LENGTH,
        `Keep the title under ${MAX_TITLE_LENGTH} characters`,
      )
      .describe("What the task is"),
    day: z
      .string()
      .refine(isDayKey, "Expected a calendar date as YYYY-MM-DD")
      .describe(
        "Day the task falls on, as YYYY-MM-DD. Resolve relative days like 'tomorrow' against the current date in your runtime context, not against a date read off the screen.",
      ),
    time: z
      .string()
      .refine(isTimeOfDay, "Expected a 24-hour time as HH:mm")
      .describe(
        "Start time as 24-hour HH:mm. The grid shows 30-minute slots, but any minute is accepted and renders in the slot it falls in.",
      ),
  }),
  run: async ({ title, day, time }): Promise<Task> => {
    const ownerEmail = requireOwnerEmail();
    const task: Task = {
      id: nanoid(),
      title,
      day,
      time,
      createdAt: new Date().toISOString(),
    };
    await getDb()
      .insert(tasks)
      .values({ ...task, ownerEmail, orgId: getRequestOrgId() });
    return task;
  },
});
