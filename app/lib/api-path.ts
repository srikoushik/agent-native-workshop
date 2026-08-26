import { appBasePath } from "@agent-native/core/client/api-path";

/** Prefix an app `/api/*` path with the workspace base path. */
export function appApiPath(path: string): string {
  if (!path.startsWith("/api/")) return path;
  return `${appBasePath()}${path}`;
}
