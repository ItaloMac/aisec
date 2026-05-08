import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import logo from "@/assets/aisec-logo.jpg";
import { logout, currentUser, currentRole, currentSectors } from "@/lib/auth";
import { SECTORS } from "@/lib/sectors";
import { LayoutDashboard, Radar, LogOut, Bell, Globe2, HardHat, Menu, X } from "lucide-react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { location } = useRouterState();
  const user = currentUser();
  const role = currentRole();
  const sectorIds = currentSectors();
  const sectorNames = SECTORS.filter((s) => sectorIds.includes(s.id)).map((s) => s.name);
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["global", "supervisor"] },
    { to: "/monitoramento", label: "Monitoramento", icon: Radar, roles: ["global", "supervisor"] },
    { to: "/notificacoes", label: "Notificações", icon: Bell, roles: ["global"] },
  ].filter((n) => n.roles.includes(role));

  const SidebarContent = (
    <>
      <div className="p-6 border-b border-border flex items-center gap-3">
        <img src={logo} alt="AISEC" className="w-10 h-10 rounded-md object-cover" />
        <div className="flex-1">
          <div className="font-display font-bold tracking-wider text-lg">AISEC</div>
          <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Safety Intel</div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((n) => {
          const active = location.pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setMobileOpen(false)}
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
      <div className="p-3 border-t border-border space-y-2">
        <div className="px-3 py-2 space-y-1.5">
          <div className="text-xs text-muted-foreground truncate">{user}</div>
          <div className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm ${role === "global" ? "bg-primary/15 text-primary" : "bg-accent/20 text-accent-foreground"}`}>
            {role === "global" ? <Globe2 className="w-3 h-3" /> : <HardHat className="w-3 h-3" />}
            {role === "global" ? "Acesso Global" : "Supervisor"}
          </div>
          {role === "supervisor" && sectorNames.length > 0 && (
            <div className="text-[10px] text-muted-foreground leading-tight">
              {sectorNames.join(" · ")}
            </div>
          )}
        </div>
        <button
          onClick={() => { logout(); navigate({ to: "/login" }); }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card/40 flex-col">
        {SidebarContent}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 inset-x-0 z-40 h-14 border-b border-border bg-card/95 backdrop-blur flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-md text-foreground hover:bg-muted"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="AISEC" className="w-7 h-7 rounded-md object-cover" />
          <span className="font-display font-bold tracking-wider text-sm">AISEC</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="md:hidden fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col animate-in slide-in-from-left duration-200">
            {SidebarContent}
          </aside>
        </>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
