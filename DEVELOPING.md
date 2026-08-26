# Agent Native Workshop — Development Guide

For development-mode agents editing this app's source. For app operations and
tool rules, see AGENTS.md.

## Tech Stack

- **Framework**: `@agent-native/core` (Nitro server + React Router 8 SSR)
- **Package manager**: pnpm
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, shadcn/ui (Radix +
  Tabler icons)
- **Database**: Drizzle ORM over portable SQL (`DATABASE_URL`; local dev
  defaults to SQLite at `file:./data/app.db`)
- **State**: settings in SQL via the settings API, structured data in SQL via
  Drizzle, transient UI state in `application_state`
- **Path aliases**: `@/*` → `app/`, `@shared/*` → `shared/`

## Project Structure

```
actions/         App operations (defineAction). Agent tools + CLI + UI data.
app/             React SPA
  components/
    layout/      AppLayout — bare shell (no nav rail, no agent panel)
    ui/          shadcn/ui primitives
  hooks/         use-navigation-state (agent ↔ UI binding), use-mobile
  lib/           utils, api-path
  pages/         Screen components
  routes/        File-based routes; `_app.*` render inside AppLayout
server/          Nitro server
  db/            Drizzle schema + connection
  lib/           env-config and other server modules
  middleware/    Global auth guard
  plugins/       Startup: agent-chat, auth, core-routes, db migrations
  routes/        Route-only endpoints (SSR catch-all lives here)
shared/          Types shared by server and app
data/            Local development database
```

## Adding App Data

Normal app data starts as an action, not a custom route. Add
`actions/<verb>-<resource>.ts` with `defineAction`, mark reads with
`http: { method: "GET" }`, and call reads/writes from React with
`useActionQuery` / `useActionMutation` from `@agent-native/core/client/hooks`.
This keeps the UI and the agent on one contract and lets mutating actions
refresh action-backed queries automatically.

## Adding a Route-Only Endpoint

Use `server/routes/api/` only for protocols an action cannot model: multipart
uploads, streaming/SSE/WebSocket, webhooks, OAuth callbacks/redirects, public
SEO/OG endpoints, or binary/static asset serving. Do not add `/api/*` routes
for normal CRUD — the action endpoint already exists at
`/_agent-native/actions/:name`.

## Database

`server/db/schema.ts` declares tables; `server/plugins/db.ts` owns migrations.
Both must change together: a column added to the schema without a matching
migration silently 500s every query touching a pre-existing production table.
`server/plugins/db.spec.ts` is the regression guard for exactly that.

Write portable SQL only — SQLite locally, Postgres in production. Use `getDb()`
from `server/db/index.ts` for queries.

## Server Plugins

Startup logic lives in `server/plugins/`. Files there run once at boot:

- `agent-chat.ts` — the agent's system prompt, initial tools, and action registry
- `auth.ts` — sign-in configuration and public paths. Inactive while `.env`
  sets `AUTH_DISABLED=1` (no sign-in page; every request runs as
  `dev@local.test`). Remove that line to turn the flow back on, and never set
  it in a deployment environment — the build warns but does not block.
- `core-routes.ts` — SSE, declared env keys, deep-link resolution
- `db.ts` — migrations

## Getting Data On Screen

Two paths, and picking the right one is most of this app's perceived speed:

- **Page data → route `loader`.** It runs on the server during SSR, so the
  HTML arrives complete — no spinner, no client round trip. `loader` is a
  server-only export, so importing an action there never reaches the browser
  bundle. `app/routes/_app._index.tsx` is the worked example.
- **Data that changes after load → `useActionQuery` / `useActionMutation`.**
  Then register the query key with `useDbSync` in `app/root.tsx`, otherwise
  agent-side writes only appear after a manual reload.

`app/root.tsx` renders with `isPublicPath`, which skips the framework's
`ClientOnly` gate so the server streams real markup instead of a spinner that
waits on the whole JS bundle. Anything that must not run during SSR (the agent
navigation binding, for instance) mounts after hydration — see `AppLayout`.

## Weight

The app shell is intentionally bare. `AgentSidebar` and the settings screens
are the heaviest imports in the framework; adding either puts assistant-ui,
markdown rendering, and syntax highlighting on every route. Add them where you
need them, not in the shell.

## TypeScript Everywhere

All code here is TypeScript. Never create `.js`, `.cjs`, or `.mjs` files. Use
ESM imports, not CommonJS.

## Commands

```bash
pnpm dev                     # Dev server
pnpm build                   # Production build
pnpm typecheck               # TypeScript validation
pnpm test                    # Vitest
pnpm action <name> [--args]  # Run an action from the CLI
pnpm agent-native:doctor     # Framework health check
```
