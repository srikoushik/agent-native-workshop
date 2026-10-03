# Agent Native Workshop

A day-view calendar built one chapter at a time on an agent-native skeleton.
You can put tasks on a day and remove them from the UI, from the CLI, or by
asking an agent. All three go through the same actions.

## Chapters

Each chapter is a branch cut from `main` and merged back in order.

| Branch | Adds |
| --- | --- |
| `chapter-01-setup` | The skeleton: one `hello` action, one screen |
| `chapter-02-calendar-ui` | The day view: 30-minute slots, day-to-day navigation |
| `chapter-03-create-task` | Tap a slot to add a task; tasks at the same time share a row. MCP wiring for Claude Code and OpenCode |
| `chapter-04-delete-task` | Tap a task, confirm, delete |

## Run it

```bash
pnpm install
cp .env.example .env      # then uncomment AUTH_DISABLED=1 to skip sign-in
pnpm dev
```

Open the printed URL to land on today. `?date=YYYY-MM-DD` opens another day.
Try the same operations from the CLI:

```bash
pnpm action create-task --title "Standup" --day 2026-10-03 --time 09:30
pnpm action list-tasks --day 2026-10-03
pnpm action delete-task --id <id from list-tasks>
```

## Use it from Claude Code or OpenCode

`.mcp.json` (Claude Code) and `opencode.json` (OpenCode) both start
`scripts/mcp-serve.sh`. That script exposes this app's actions as MCP tools.
It needs the dev server running and an `ACCESS_TOKEN` in `.env`:

```bash
pnpm exec agent-native mcp token   # put the printed token in .env as ACCESS_TOKEN
```

The script reads the token at spawn time, so neither config file holds a
secret. Locally it acts as `dev@local.test`, the same user `AUTH_DISABLED`
gives the UI. Tasks you add from the agent show up in the browser without a
reload.

## Layout

```
actions/            Every app operation. Agent tools, CLI commands, and UI data
                    all go through these.
  create-task.ts    Put a task on a day at a time.
  list-tasks.ts     Everything on one day, earliest first.
  delete-task.ts    Remove a task by id (scoped to its owner).
  view-screen.ts    Lets the agent see the current view.
  navigate.ts       Lets the agent move the UI.
  hello.ts          The chapter-01 example action.
app/                React SPA (React Router 8, file-based routes)
  routes/           `_app._index.tsx` resolves the day in its `loader`.
  pages/Day.tsx     The day view; reads tasks with `useActionQuery`.
  components/
    calendar/       DayGrid, CreateTaskDialog, DeleteTaskDialog
    layout/         AppLayout: a bare shell plus `useDbSync`
    ui/             shadcn/ui primitives
  hooks/            use-navigation-state binds the UI to the agent
server/             Nitro server
  db/               Drizzle schema (`tasks`) + connection
  plugins/          agent-chat, auth, core-routes, db migrations
  lib/              env-config (declared credentials), owner scoping
shared/             Types and day/slot helpers shared by server and app
scripts/            mcp-serve.sh for external coding agents
.agents/skills/     Framework skills the agent reads before deeper work
```

## Adding a feature

1. Add an action in `actions/`. Reads use `http: { method: "GET" }`.
2. Get its data on screen:
   - **Page data:** call it from the route's `loader`. It server-renders, so
     the page arrives complete with no loading state.
   - **Data that changes after load:** call it with `useActionQuery` /
     `useActionMutation`, like `app/pages/Day.tsx`. `useDbSync` in
     `AppLayout` refetches it when the agent writes.
3. If it needs storage, add a table to `server/db/schema.ts` **and** a
   migration in `server/plugins/db.ts`.
4. Add a route branch to `app/hooks/use-navigation-state.ts` so the agent
   knows where the user is.

`AGENTS.md` has the rules; `DEVELOPING.md` has the details.

## What is deliberately not here

No nav rail, no agent chat panel, no settings screen. The agent chat rail is a
heavy import — assistant-ui, markdown rendering, syntax highlighting — and it
was costing ~200 MB of dev requests to paint one line of text. Add it back when
you want it by wrapping `children` in `AgentSidebar` inside
`app/components/layout/AppLayout.tsx`.

The agent itself is untouched: `server/plugins/agent-chat.ts` still registers
every action, so `pnpm action <name>`, tool calls, and MCP all work.

## Sign-in

Setting `AUTH_DISABLED=1` in your `.env` removes the sign-in page entirely and
runs every request as `dev@local.test`. It ships commented out in
`.env.example`; uncomment it locally. Delete it to get the real flow back
(configured in `server/plugins/auth.ts`).

**It is local-development only, and nothing enforces that.** The framework
prints a `production configuration errors` warning when it is set, but the
build still succeeds — an app deployed with `AUTH_DISABLED` has no
authentication at all. Never set it in a deployment environment.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm test` | Vitest |
| `pnpm typecheck` | TypeScript |
| `pnpm action <name> [--flag value]` | Run an action from the CLI |
| `pnpm agent-native:doctor` | Framework health check |
