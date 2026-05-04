import { createFileRoute } from "@tanstack/react-router";
import { useSim } from "@/lib/simulation";
import { Card } from "@/components/ui/card";
import { ShieldCheck, TrendingUp, AlertOctagon, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";
import { SECTORS } from "@/lib/sectors";
import { canAccessSector, currentRole } from "@/lib/auth";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · AISEC" },
      { name: "description", content: "Métricas de segurança, acidentes evitados e conformidade de EPI em tempo real." },
    ],
  }),
  component: DashboardPage,
});

const weekly = [
  { d: "Seg", v: 18 }, { d: "Ter", v: 22 }, { d: "Qua", v: 19 },
  { d: "Qui", v: 28 }, { d: "Sex", v: 31 }, { d: "Sáb", v: 14 }, { d: "Dom", v: 9 },
];

function DashboardPage() {
  const { metrics, history } = useSim();
  const role = currentRole();
  const visibleSectors = SECTORS.filter((s) => canAccessSector(s.id));
  const visibleHistory = history.filter((h) => canAccessSector(h.sectorId));

  const bySector = visibleSectors.map((s) => ({
    name: s.name,
    infrações: visibleHistory.filter((h) => h.sectorId === s.id).length + Math.floor(Math.random() * 3) + 1,
  }));

  return (
    <div className="p-8 space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">
          {role === "global" ? "Visão geral" : "Visão do supervisor"}
        </div>
        <h1 className="font-display text-3xl font-bold">Dashboard de Segurança</h1>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Kpi icon={ShieldCheck} label="Acidentes evitados (total)" value={metrics.accidentsAvoided.toLocaleString("pt-BR")} accent="primary" />
        <Kpi icon={TrendingUp} label="Evitados este mês" value={metrics.monthAvoided.toString()} sub="+12% vs. mês anterior" accent="primary" />
        <Kpi icon={Activity} label="Conformidade EPI" value={`${metrics.compliance}%`} sub="média 24h" />
        <Kpi icon={AlertOctagon} label="Setores em alerta" value={metrics.activeAlerts.toString()} sub={`${metrics.last24h} infrações 24h`} accent={metrics.activeAlerts > 0 ? "destructive" : undefined} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Acidentes evitados · semana</h3>
              <p className="text-xs text-muted-foreground">Detecções e intervenções por dia</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="var(--primary)" strokeWidth={3} dot={{ fill: "var(--primary)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display font-semibold mb-1">Últimas ocorrências</h3>
          <p className="text-xs text-muted-foreground mb-4">Eventos resolvidos recentemente</p>
          <ul className="space-y-3 max-h-64 overflow-y-auto">
            {visibleHistory.slice(0, 8).map((h) => (
              <li key={h.id} className="flex items-start gap-3 text-sm">
                <div className={`mt-1 w-2 h-2 rounded-full ${h.escalated ? "bg-destructive" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{h.sectorName} · {h.epi}</div>
                  <div className="text-xs text-muted-foreground">{h.employeeId} · {new Date(h.startedAt).toLocaleTimeString("pt-BR")}</div>
                </div>
              </li>
            ))}
            {visibleHistory.length === 0 && <li className="text-sm text-muted-foreground">Sem ocorrências.</li>}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-display font-semibold mb-4">Infrações por setor</h3>
        <div className="h-64">
          <ResponsiveContainer>
            <BarChart data={bySector}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }} />
              <Bar dataKey="infrações" fill="var(--primary)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: any; label: string; value: string; sub?: string; accent?: "primary" | "destructive" }) {
  const color = accent === "destructive" ? "text-destructive" : accent === "primary" ? "text-primary" : "text-foreground";
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className={`mt-2 text-3xl font-display font-bold ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </Card>
  );
}
