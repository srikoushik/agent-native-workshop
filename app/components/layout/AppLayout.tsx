import { useDbSync } from "@agent-native/core/client/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { useNavigationState } from "@/hooks/use-navigation-state";

/**
 * Publishes the current screen to the agent's `navigation` application state,
 * and listens for the agent's writes coming back.
 *
 * `useDbSync` is what makes an agent-side change visible without a reload: it
 * invalidates the `["action"]` query keys, so every `useActionQuery` refetches.
 * Without it the UI only catches up on the slow polling fallback.
 */
function AgentSync() {
  const queryClient = useQueryClient();
  useNavigationState();
  useDbSync({ queryClient });
  return null;
}

/**
 * App shell. Deliberately bare — no nav rail, no agent panel. Add chrome here
 * when you have screens that need it.
 *
 * If you want the agent chat rail back, wrap `children` in `AgentSidebar` from
 * `@agent-native/core/client/agent-chat`. It is a heavy import (assistant-ui,
 * markdown, syntax highlighting), so add it deliberately, not by default.
 */
export function AppLayout({ children }: { children: ReactNode }) {
  // The page itself server-renders; the agent navigation binding is
  // browser-only, so it mounts after hydration.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {mounted && <AgentSync />}
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
