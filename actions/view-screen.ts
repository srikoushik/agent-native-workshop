import { defineAction } from "@agent-native/core/action";
import { readAppState } from "@agent-native/core/application-state";
import { z } from "zod";

import { isDayKey } from "../shared/day.js";

/**
 * Lets the agent see what the user is looking at. The UI writes the
 * `navigation` application-state key from `useNavigationState()`; this action
 * reads it back and fills in the data behind the current view.
 */
export default defineAction({
  description:
    "See what the user is currently looking at on screen — the day on show and the tasks on it. Call this when the answer depends on visible state.",
  schema: z.object({}),
  http: false,
  run: async () => {
    const navigation = (await readAppState("navigation")) as {
      view?: string;
      date?: string;
    } | null;

    // No day on screen yet (nothing has hydrated) means there is nothing to
    // look up — return the navigation state alone rather than guessing a day.
    if (!isDayKey(navigation?.date)) return { navigation: navigation ?? null };

    // Reuse the action rather than re-querying, so the agent sees exactly the
    // rows the grid is rendering.
    const { default: listTasks } = await import("./list-tasks.js");
    return {
      navigation,
      tasks: await listTasks.run({ day: navigation.date }),
    };
  },
});
