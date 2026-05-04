import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSim } from "@/lib/simulation";
import { riskColor, riskBg, ALERT_THRESHOLD } from "@/lib/risk";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AlertTriangle, Users, Zap } from "lucide-react";

export const Route = createFileRoute("/_app/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento · AISEC" },
      { name: "description", content: "Mapa de calor em tempo real do uso de EPI por setor industrial." },
    ],
  }),
  component: MonitoringPage,
});

function MonitoringPage() {
  const { states, triggerSector } = useSim();
  const list = Object.values(states);

  return (
    <div className="p-8 space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Tempo real</div>
          <h1 className="font-display text-3xl font-bold">Monitoramento de Setores</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mapa de calor automático · alerta crítico em {ALERT_THRESHOLD}s sem EPI
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <Legend color="hsl(150,80%,55%)" label="Seguro" />
          <Legend color="hsl(90,80%,55%)" label="Atenção" />
          <Legend color="hsl(50,80%,55%)" label="Risco" />
          <Legend color="hsl(25,80%,55%)" label="Crítico" />
        </div>
      </header>

      <Tabs defaultValue="cards">
        <TabsList>
          <TabsTrigger value="cards">Cards por setor</TabsTrigger>
          <TabsTrigger value="planta">Planta baixa</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((st) => {
              const pct = Math.min(100, (st.seconds / ALERT_THRESHOLD) * 100);
              const color = st.active ? riskColor(st.seconds) : "hsl(150,40%,45%)";
              return (
                <Card
                  key={st.sector.id}
                  className="p-5 relative overflow-hidden transition-colors"
                  style={{ backgroundColor: st.active ? riskBg(st.seconds) : undefined, borderColor: st.active ? color : undefined }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">{st.sector.zone}</div>
                      <h3 className="font-display font-bold text-lg mt-0.5">{st.sector.name}</h3>
                    </div>
                    {st.active && st.seconds >= ALERT_THRESHOLD && (
                      <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="w-4 h-4" /> {st.sector.workers}
                    </div>
                    <div className="ml-auto font-mono text-lg font-semibold" style={{ color }}>
                      {st.active ? `${st.seconds}s` : "OK"}
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>

                  {st.active && st.incident && (
                    <div className="mt-3 text-xs text-muted-foreground">
                      EPI: <span className="text-foreground font-medium">{st.incident.epi}</span> · {st.incident.station}
                    </div>
                  )}
                  {!st.active && (
                    <button
                      onClick={() => triggerSector(st.sector.id)}
                      className="mt-3 text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" /> Simular evento
                    </button>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="planta" className="mt-6">
          <PlantView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-sm" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function PlantView() {
  const { states, triggerSector } = useSim();
  const [hover, setHover] = useState<string | null>(null);

  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground mb-3 px-2">Planta esquemática · clique num setor para simular</div>
      <div className="relative w-full" style={{ aspectRatio: "1000 / 600" }}>
        <svg viewBox="0 0 1000 600" className="w-full h-full rounded-md" style={{ background: "var(--muted)" }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--border)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="1000" height="600" fill="url(#grid)" />
          {Object.values(states).map((st) => {
            const color = st.active ? riskColor(st.seconds) : "hsl(150,40%,40%)";
            const fill = st.active ? riskBg(st.seconds, 0.45) : "hsla(150,40%,40%,0.18)";
            return (
              <g key={st.sector.id}
                 onMouseEnter={() => setHover(st.sector.id)}
                 onMouseLeave={() => setHover(null)}
                 onClick={() => !st.active && triggerSector(st.sector.id)}
                 style={{ cursor: "pointer" }}>
                <rect
                  x={st.sector.x} y={st.sector.y} width={st.sector.w} height={st.sector.h}
                  rx="8"
                  fill={fill}
                  stroke={color}
                  strokeWidth={st.active && st.seconds >= ALERT_THRESHOLD ? 3 : 1.5}
                  className={st.active && st.seconds >= ALERT_THRESHOLD ? "animate-pulse" : ""}
                />
                <text x={st.sector.x + 14} y={st.sector.y + 28} fill="white" fontSize="16" fontWeight="600" fontFamily="Space Grotesk">
                  {st.sector.name}
                </text>
                <text x={st.sector.x + 14} y={st.sector.y + 48} fill="rgba(255,255,255,0.7)" fontSize="11">
                  {st.sector.zone} · {st.sector.workers} pessoas
                </text>
                {st.active && (
                  <text x={st.sector.x + st.sector.w - 14} y={st.sector.y + st.sector.h - 14} fill={color} fontSize="22" fontWeight="700" textAnchor="end" fontFamily="monospace">
                    {st.seconds}s
                  </text>
                )}
              </g>
            );
          })}
        </svg>
        {hover && (() => {
          const st = states[hover];
          if (!st) return null;
          return (
            <div className="absolute top-2 right-2 bg-popover border border-border rounded-md p-3 text-xs shadow-lg pointer-events-none">
              <div className="font-semibold text-sm">{st.sector.name}</div>
              <div className="text-muted-foreground">{st.sector.zone}</div>
              <div className="mt-1">Status: <span style={{ color: st.active ? riskColor(st.seconds) : "var(--primary)" }}>
                {st.active ? `${st.seconds}s sem EPI` : "OK"}
              </span></div>
            </div>
          );
        })()}
      </div>
    </Card>
  );
}
