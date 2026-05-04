import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { isAuthed } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { CriticalIncidentModal } from "@/components/CriticalIncidentModal";

export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    if (typeof window !== "undefined" && !isAuthed()) {
      throw redirect({ to: "/login", search: { redirect: location.href } as never });
    }
  },
  component: () => (
    <AppShell>
      <Outlet />
      <CriticalIncidentModal />
    </AppShell>
  ),
});
