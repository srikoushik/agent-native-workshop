# Calendar

An open-source, agent-native alternative to the Google Calendar + Calendly combo.
An agent-powered calendar with Google Calendar sync and Calendly-style public
booking links — schedule, find slots, and manage availability in plain English.

**Live app: [calendar.agent-native.com](https://calendar.agent-native.com)**

Connect your Google Calendar and the agent can read your schedule, find free
slots, create events, and manage booking links. Anything you can do in the UI,
the agent can do through the same actions.

## Features

- Day, week, and month views with multiple Google accounts overlayed.
- Google Calendar sync, native working locations, and read-only ICS feed
  subscriptions.
- Weekly availability with timezone support for slot-finding.
- Calendly-style public booking links at `/book/{slug}` with custom fields.
- Ask the agent anything schedule-related, from "am I free Thursday?" to
  creating and rescheduling events.
- Share booking links with teammates and required co-hosts.

## Run locally

This is a standalone repo — no pnpm workspace, no sibling apps.

```bash
pnpm install
cp .env.example .env   # already done if you cloned this working copy
pnpm dev
```

The app serves at the port printed by `agent-native dev` (default
`http://localhost:3000`). Local data goes to a SQLite file at `data/app.db`,
created on first run.

### Environment

Every provider credential is optional — the app boots and the calendar UI works
without any of them. Fill in `.env` to light up the corresponding feature:

| Variable                                | Enables                                  |
| --------------------------------------- | ---------------------------------------- |
| `BETTER_AUTH_SECRET`                    | Login (required; generated for local dev) |
| `ANTHROPIC_API_KEY`                     | The agent chat                           |
| `GOOGLE_CLIENT_ID` / `_SECRET`          | Google Calendar sync + Google sign-in    |
| `ZOOM_CLIENT_ID` / `_SECRET`            | Zoom links on bookings                   |
| `TURNSTILE_SECRET_KEY` / `VITE_..._SITE_KEY` | Captcha on public booking pages     |
| `DATABASE_URL`                          | Postgres/libSQL instead of local SQLite  |

Connecting Google Calendar in dev needs a Google OAuth client — see the docs for
setup.

### Common commands

```bash
pnpm dev          # dev server
pnpm build        # production build (runs doctor)
pnpm start        # serve the production build
pnpm test         # vitest
pnpm typecheck    # type check
pnpm doctor       # framework health checks
```

Full docs: [agent-native.com/docs/template-calendar](https://agent-native.com/docs/template-calendar).
