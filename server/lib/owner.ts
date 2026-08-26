import { getRequestUserEmail } from "@agent-native/core/server/request-context";

/**
 * The caller's email, or a hard failure.
 *
 * Deliberately no sentinel fallback: a default like `local@localhost` would
 * pool every unauthenticated write into one shared tenant, which is how one
 * user ends up reading another's tasks. No session means no write.
 */
export function requireOwnerEmail(): string {
  const ownerEmail = getRequestUserEmail();
  if (!ownerEmail) throw new Error("Not authenticated");
  return ownerEmail;
}
