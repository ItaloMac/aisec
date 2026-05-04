import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { isAuthed, login, type Role } from "@/lib/auth";
import { SECTORS } from "@/lib/sectors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import logo from "@/assets/aisec-logo.jpg";
import { ShieldCheck, Globe2, HardHat } from "lucide-react";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthed()) {
      throw redirect({ to: "/dashboard" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("operador@aisec.io");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("global");
  const [sectors, setSectors] = useState<string[]>([]);

  const toggleSector = (id: string) =>
    setSectors((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (role === "supervisor" && sectors.length === 0) return;
    login(email, role, role === "supervisor" ? sectors : []);
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary/30 via-card to-background overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 70%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="relative flex items-center gap-3">
          <img src={logo} alt="AISEC" className="w-12 h-12 rounded-lg" />
          <div>
            <div className="font-display font-bold tracking-widest text-xl">AISEC</div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Safety Intelligence</div>
          </div>
        </div>
        <div className="relative space-y-4 max-w-lg">
          <h1 className="font-display text-4xl font-bold leading-tight">
            Segurança no ambiente de trabalho exige <span className="text-primary">inteligência, inovação e prevenção</span>.
          </h1>
          <p className="text-muted-foreground">
            Monitore o uso de EPI em todos os setores em tempo real, com mapa de calor de risco e alertas de infração crítica.
          </p>
          <div className="flex items-center gap-2 text-sm text-primary">
            <ShieldCheck className="w-4 h-4" /> Plataforma segura · Visão em tempo real
          </div>
        </div>
        <div className="relative text-xs text-muted-foreground">© AISEC · Todos os direitos reservados</div>
      </div>

      <div className="flex items-center justify-center p-8 overflow-y-auto">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div className="lg:hidden flex items-center gap-3">
            <img src={logo} alt="AISEC" className="w-10 h-10 rounded-md" />
            <div className="font-display font-bold tracking-widest text-lg">AISEC</div>
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold">Entrar na central</h2>
            <p className="text-sm text-muted-foreground mt-1">Acesse o painel de monitoramento de EPI.</p>
          </div>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nível de acesso</Label>
            <div className="grid grid-cols-2 gap-2">
              <RoleCard
                active={role === "global"}
                onClick={() => setRole("global")}
                icon={<Globe2 className="w-4 h-4" />}
                title="Global"
                desc="Acesso total"
              />
              <RoleCard
                active={role === "supervisor"}
                onClick={() => setRole("supervisor")}
                icon={<HardHat className="w-4 h-4" />}
                title="Supervisor"
                desc="Setores próprios"
              />
            </div>
          </div>

          {role === "supervisor" && (
            <div className="space-y-2">
              <Label>Setores sob sua responsabilidade</Label>
              <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto rounded-md border border-border p-3">
                {SECTORS.map((s) => (
                  <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={sectors.includes(s.id)}
                      onCheckedChange={() => toggleSector(s.id)}
                    />
                    <span className="truncate">{s.name}</span>
                  </label>
                ))}
              </div>
              {sectors.length === 0 && (
                <p className="text-xs text-destructive">Selecione ao menos um setor.</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full">Entrar</Button>
          <p className="text-xs text-center text-muted-foreground">Demo · qualquer credencial é aceita</p>
        </form>
      </div>
    </div>
  );
}

function RoleCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-md border p-3 transition-colors ${active ? "border-primary bg-primary/10" : "border-border hover:bg-muted"}`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">{icon}{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
    </button>
  );
}
