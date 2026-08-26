# Agent Native Workshop — Agent Guide

This is an agent-native app skeleton. Right now it does one thing: the `hello`
action returns a greeting and the home screen renders it. Everything else here
is the wiring you build on.

## Skills

Framework rules live in `.agents/skills/`. Read the relevant skill before
deeper work — `actions`, `storing-data`, `context-awareness`,
`adding-a-feature`, `security`, and `portability` are the ones you will reach
for first.

## Core Rules

- Every user-facing operation is an action in `actions/`. The agent calls it as
  a tool, the CLI runs it as `pnpm action <name>`, and the UI calls it through
  `useActionQuery` / `useActionMutation`. Do not fork behaviour between the two.
- The action schema is authoritative when a parameter is unclear.
- Use `server/routes/api/` only for what an action cannot model: uploads,
  streaming/SSE, webhooks, OAuth callbacks, public SEO/OG endpoints, binary
  assets.
- Store application data in SQL through Drizzle. Store large file/blob payloads
  in configured file/blob storage, not SQL: no base64, `data:` URLs, images,
  video/audio, PDFs, ZIPs, screenshots, or thumbnails in app tables,
  `application_state`, `settings`, or `resources` — persist URLs, ids, or
  handles instead.
- Never hardcode API keys, tokens, webhook URLs, signing secrets, or
  credential-looking literals. Register credentials in `server/lib/env-config.ts`
  and use obvious placeholders in examples.
- Sign-in is intentionally off in local development: `.env` sets
  `AUTH_DISABLED=1` and every request runs as `dev@local.test`. Do not add a
  sign-in gate, route guard, or session check to work around it — remove the
  flag instead. Never set it in a deployment environment: the build only warns,
  it does not block, so a deployed app with it set has no authentication.
- For external integrations, inspect the workspace/provider connection catalog
  first and reuse its scoped resolver.
- Use `view-screen` when the active view or selection is unclear, and
  `navigate` when the user says "show me", "go to", or "open".
- Use the current date from runtime context, not a rendered date, when the user
  says today/tomorrow/yesterday.
- Write portable SQL: this runs on SQLite locally and Postgres in production.
- Every table added to `server/db/schema.ts` needs a matching migration in
  `server/plugins/db.ts` with a unique `name:` slug.

## Application State

- `navigation` exposes the current view. It is written by
  `app/hooks/use-navigation-state.ts` and read by the `view-screen` action.
- `navigate` is a one-shot command the UI consumes and clears.
- Extend both halves of `use-navigation-state.ts` whenever you add a route.

## UI Shape

- The shell in `app/components/layout/AppLayout.tsx` is deliberately bare: no
  nav rail, no agent chat panel, no settings screen. Do not add them back
  without being asked — `AgentSidebar` and the settings screens are the
  heaviest imports in the framework and land on every route from the shell.
- Page data belongs in the route's `loader` so it server-renders; use
  `useActionQuery` only for data that changes after load, and register its key
  with `useDbSync`.
- `app/root.tsx` uses `isPublicPath`, so routes really do render on the
  server. Anything browser-only must mount after hydration, not during SSR.

## Source Changes

Before building common workspace or agent UI, read `agent-native-toolkit`; read
`customizing-agent-native` before adapting shared UI.
