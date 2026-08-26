import { defineAction } from "@agent-native/core/action";
import { and, asc, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { tasks } from "../server/db/schema.js";
import { requireOwnerEmail } from "../server/lib/owner.js";
import type { Task } from "../shared/api.js";
import { isDayKey } from "../shared/day.js";

/**
 * Everything on one day, in the order it appears down the grid. The day view
 * reads this through `useActionQuery`, so an agent write invalidates it and
 * the grid refills without a reload.
 */
export default defineAction({
  description:
    "List the tasks on one day, earliest first. Use this to see what is already scheduled before adding or changing anything.",
  schema: z.object({
    day: z
      .string()
      .refine(isDayKey, "Expected a calendar date as YYYY-MM-DD")
      .describe(
        "Day to list, as YYYY-MM-DD. Resolve relative days like 'today' against the current date in your runtime context, not against a date read off the screen.",
      ),
  }),
  http: { method: "GET" },
  run: async ({ day }): Promise<Task[]> => {
    const ownerEmail = requireOwnerEmail();
    const db = getDb();
    return db
      .select({
        id: tasks.id,
        title: tasks.title,
        day: tasks.day,
        time: tasks.time,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(and(eq(tasks.ownerEmail, ownerEmail), eq(tasks.day, day)))
      .orderBy(asc(tasks.time), asc(tasks.createdAt));
  },
});
