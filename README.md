# Agent Native Workshop

An agent-native app skeleton: one action, one screen, and the framework wiring
around them. `hello` returns a greeting, the home page renders it, and the
agent can call the same action as a tool.

## Run it

```bash
pnpm install
cp .env.example .env      # then uncomment AUTH_DISABLED=1 to skip sign-in
pnpm dev
```

Open the printed URL and you land straight on **Welcome to Agent Native!**
The greeting is served by `actions/hello.ts`, not hardcoded in the page. Try
the same action from the CLI:

```bash
pnpm action hello --name "Ada"
```

## Layout

```
actions/          Every app operation. Agent tools, CLI commands, and UI data
                  all go through these.
  hello.ts        The example action — delete it once you have a real one.
  view-screen.ts  Lets the agent see the current view.
  navigate.ts     Lets the agent move the UI.
app/              React SPA (React Router 8, file-based routes)
  routes/         `_app.*` routes render inside the app shell.
                  `_app._index.tsx` loads the greeting in its `loader`.
  pages/          Screen components
  components/
    layout/       AppLayout — a bare shell. No nav rail, no agent panel.
    ui/           shadcn/ui primitives
  hooks/          use-navigation-state binds the UI to the agent
server/           Nitro server
  db/             Drizzle schema + connection
  plugins/        agent-chat, auth, core-routes, db migrations
  lib/            env-config (declared credentials)
shared/           Types shared by server and app (`@shared/*`)
.agents/skills/   Framework skills the agent reads before deeper work
```

## Build your first feature

1. Add an action in `actions/`. Reads use `http: { method: "GET" }`.
2. Get its data on screen:
   - **Page data** — call it from the route's `loader`, like
     `app/routes/_app._index.tsx` does. It server-renders, so the page arrives
     complete with no loading state.
   - **Data that changes after load** — call it from the component with
     `useActionQuery` / `useActionMutation`, then register its query key with
     `useDbSync` in `app/root.tsx` so agent-side writes refresh the UI.
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
