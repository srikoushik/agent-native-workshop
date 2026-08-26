import "../db/index.js";
import { ensureAdditiveColumns, getDbExec, runMigrations } from "@agent-native/core/db";

import * as schema from "../db/schema.js";

/**
 * Every Drizzle table exported from schema.ts. Filters out type-only and
 * helper exports the same way db.spec.ts's regression guard does: a real
 * table carries a Symbol-keyed drizzle metadata bag, plain exports don't.
 */
function isDrizzleTable(value: unknown): value is object {
  return (
    !!value &&
    typeof value === "object" &&
    Object.getOwnPropertySymbols(value).some((s) =>
      s.toString().includes("drizzle"),
    )
  );
}

const schemaTables = Object.values(schema).filter(isDrizzleTable);

// Convention: every migration below MUST set a unique `name:` slug and never
// change once shipped. Version numbers alone are not a safe identity across
// parallel branches that each extend this list independently.
//
// Write portable SQL only — this runs on SQLite locally and Postgres in
// production. See the `portability` skill.
export const runAppMigrations = runMigrations(
  [
    {
      version: 1,
      name: "create-notes",
      sql: `CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL,
    owner_email TEXT NOT NULL DEFAULT '',
    org_id TEXT,
    visibility TEXT NOT NULL DEFAULT 'private'
  )`,
    },
  ],
  { table: "app_migrations" },
);

/**
 * The migration list above is the authoritative source for tables, indexes,
 * and data transforms. `ensureAdditiveColumns` runs after it as a safety net
 * for schema drift: a column added to schema.ts without a matching ALTER
 * migration would otherwise 500 every query touching a pre-existing table. It
 * only adds missing columns, and any failure is logged, never fatal.
 */
export default async (nitroApp: any): Promise<void> => {
  await runAppMigrations(nitroApp);
  try {
    const summary = await ensureAdditiveColumns({
      db: getDbExec(),
      tables: schemaTables,
    });
    if (summary.errors.length > 0) {
      console.warn(
        "[db] ensureAdditiveColumns completed with errors:",
        summary.errors,
      );
    }
  } catch (err) {
    console.warn(
      "[db] ensureAdditiveColumns failed (non-fatal):",
      err instanceof Error ? err.message : err,
    );
  }
};
