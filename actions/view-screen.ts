import { defineAction } from "@agent-native/core/action";
import { readAppState } from "@agent-native/core/application-state";
import { z } from "zod";

/**
 * Lets the agent see what the user is looking at. The UI writes the
 * `navigation` application-state key from `useNavigationState()`; this action
 * reads it back. Extend the returned shape as you add views and selections.
 */
export default defineAction({
  description:
    "See what the user is currently looking at on screen (current view). Call this when the answer depends on visible state.",
  schema: z.object({}),
  http: false,
  run: async () => {
    const navigation = await readAppState("navigation");
    return { navigation: navigation ?? null };
  },
});
