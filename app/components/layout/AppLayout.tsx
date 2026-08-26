import { useEffect, useState, type ReactNode } from "react";

import { useNavigationState } from "@/hooks/use-navigation-state";

/** Publishes the current screen to the agent's `navigation` application state. */
function NavigationSync() {
  useNavigationState();
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
      {mounted && <NavigationSync />}
      <div className="flex h-screen flex-col overflow-hidden bg-background">
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </>
  );
}
