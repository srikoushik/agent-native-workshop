import type { EnvKeyConfig } from "@agent-native/core/server";

/**
 * Credentials this app needs. They show up in the agent sidebar settings UI
 * and the onboarding checklist — never hardcode a key in source. See the
 * `secrets` skill before adding a third-party credential.
 */
export const envKeys: EnvKeyConfig[] = [
  { key: "DATABASE_URL", label: "Database URL", required: false },
  { key: "DATABASE_AUTH_TOKEN", label: "Database Auth Token", required: false },
];
