import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/aisec-logo.jpg";
import { logout, currentUser } from "@/lib/auth";
import { LayoutDashboard, Radar, LogOut } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const user = currentUser();

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/monitoramento", label: "Monitoramento", icon: Radar },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r border-border bg-card/40 flex flex-col">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <img src={logo} alt="AISEC" className="w-10 h-10 rounded-md object-cover" />
          <div>
            <div className="font-display font-bold tracking-wider text-lg">AISEC</div>
            <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Safety Intel</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map((n) => {
            const active = location.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user}</div>
          <button
            onClick={() => { logout(); navigate({ to: "/login" }); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
