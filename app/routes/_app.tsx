import { Outlet } from "react-router";

import { AppLayout } from "@/components/layout/AppLayout";

// Pathless layout route — every protected route renders inside AppLayout so
// the left rail and the agent rail persist across client-side navigations.
// Public routes (if you add any) live outside this layout.
export default function AppLayoutRoute() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
