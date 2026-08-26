import { useAgentRouteState } from "@agent-native/core/client/navigation";
import { DAY_PARAM, dayPath, resolveDayKey } from "@shared/day";

/** Compact, semantic description of the current screen, published for the agent. */
interface NavigationState {
  view: "day";
  /** `YYYY-MM-DD` the day view is showing. */
  date: string;
}

/** The one-shot command the `navigate` action writes for the UI to consume. */
interface NavigateCommand {
  view?: "day";
  date?: string;
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
  useAgentRouteState<NavigationState, NavigateCommand>({
    getNavigationState: ({ searchParams }) => ({
      view: "day",
      // Resolved rather than passed through raw, so the agent is told the day
      // actually on screen even when the URL carries no `?date=`.
      date: resolveDayKey(searchParams.get(DAY_PARAM)),
    }),
    getCommandPath: (command) => dayPath(command?.date),
  });
}
