import { table, text, ownableColumns } from "@agent-native/core/db/schema";

/**
 * One example table so the migration + ownership plumbing is wired and
 * testable. Replace `notes` with your own domain tables; every table you add
 * here also needs a migration in `server/plugins/db.ts` (see db.spec.ts).
 */
export const notes = table("notes", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  createdAt: text("created_at").notNull(),
  ...ownableColumns(),
});

/**
 * A task pinned to a time on a day.
 *
 * `day` and `time` are stored as separate text columns rather than one
 * timestamp: the day view's only query is "everything on this date", which
 * this makes an equality lookup, and neither column carries a timezone that
 * could shift a task onto the wrong day.
 */
export const tasks = table("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  /** `YYYY-MM-DD`. */
  day: text("day").notNull(),
  /** `HH:mm`, 24-hour. Sorts lexically, so ordering within a day is free. */
  time: text("time").notNull(),
  createdAt: text("created_at").notNull(),
  ...ownableColumns(),
});
