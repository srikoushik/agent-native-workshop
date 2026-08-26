import {
  table,
  text,
  ownableColumns,
} from "@agent-native/core/db/schema";

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
