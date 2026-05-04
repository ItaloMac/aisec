import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { isAuthed, login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/aisec-logo.jpg";
import { ShieldCheck } from "lucide-react";

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
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

      <div className="flex items-center justify-center p-8">
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
          <Button type="submit" className="w-full">Entrar</Button>
          <p className="text-xs text-center text-muted-foreground">Demo · qualquer credencial é aceita</p>
        </form>
      </div>
    </div>
  );
}
