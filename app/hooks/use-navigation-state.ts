import { useAgentRouteState } from "@agent-native/core/client/navigation";

/** Compact, semantic description of the current screen, published for the agent. */
interface NavigationState {
  view: "home";
}

/**
 * Two-way agent/UI navigation binding:
 *
 * - `getNavigationState` writes what the user is looking at to the
 *   `navigation` application-state key (read by the `view-screen` action).
 * - `getCommandPath` turns a one-shot `navigate` command written by the
 *   `navigate` action into a route the UI moves to.
 *
 * Add a branch to both halves whenever you add a route.
 */
export function useNavigationState() {
  useAgentRouteState<NavigationState>({
    getNavigationState: () => ({ view: "home" }),
    getCommandPath: () => "/",
  });
}
