import { createAuthPlugin } from "@agent-native/core/server";

/**
 * Sign-in configuration.
 *
 * It is switched OFF while you build: `AUTH_DISABLED=1` in `.env` skips the
 * sign-in page entirely and runs every request as `dev@local.test`. Drop that
 * line to get the flow below back — the production config check refuses a
 * deploy while the flag is set, so it cannot ship by accident.
 *
 * `publicPaths` lists routes that render for signed-out visitors — add
 * public/SEO routes here as you build them.
 */
export default createAuthPlugin({
  marketing: {
    appName: "Agent Native Workshop",
    tagline: "An agent-native app skeleton. Build something here.",
    features: [
      "The agent and the UI share one set of actions",
      "Application state keeps the agent aware of the current screen",
      "SQL-backed storage with portable migrations",
    ],
  },
  publicPaths: [],
});
