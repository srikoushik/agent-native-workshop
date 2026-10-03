import { defineAction, fail } from "@agent-native/core/action";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "../server/db/index.js";
import { tasks } from "../server/db/schema.js";
import { requireOwnerEmail } from "../server/lib/owner.js";
import type { Task } from "../shared/api.js";

/**
 * Remove a task. The UI asks the user to confirm first; the agent is expected
 * to have read the day before choosing an id.
 */
export default defineAction({
  description:
    "Delete a task by id. This is permanent. Call list-tasks first and confirm which task the user means — ids are not guessable and deleting the wrong one cannot be undone.",
  schema: z.object({
    id: z
      .string()
      .trim()
      .min(1, "A task id is required")
      .describe("Id of the task to delete, as returned by list-tasks."),
  }),
  http: { method: "DELETE" },
  run: async ({ id }): Promise<Task> => {
    const ownerEmail = requireOwnerEmail();
    const db = getDb();
    // Owner is part of the match, not a check afterwards, so a guessed id
    // belonging to someone else deletes nothing and reads as "not found".
    const match = and(eq(tasks.id, id), eq(tasks.ownerEmail, ownerEmail));

    const [task] = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        day: tasks.day,
        time: tasks.time,
        createdAt: tasks.createdAt,
      })
      .from(tasks)
      .where(match)
      .limit(1);

    // Read-then-delete rather than DELETE ... RETURNING, which is not something
    // every SQL backend this has to run on supports.
    if (!task) fail(`No task found with id ${id}`);
    await db.delete(tasks).where(match);
    return task;
  },
});
