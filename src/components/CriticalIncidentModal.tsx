import { useSim } from "@/lib/simulation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, User, ShieldOff, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function CriticalIncidentModal() {
  const { criticalIncident, acknowledgeCritical, resolveSector, escalateSector } = useSim();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!criticalIncident) return;
    const tick = () => setElapsed(Math.floor((Date.now() - criticalIncident.startedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [criticalIncident]);

  const open = !!criticalIncident;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) acknowledgeCritical(); }}>
      <DialogContent className="border-destructive/50 bg-card">
        <div className="absolute inset-0 -z-10 rounded-lg animate-pulse" style={{ background: "radial-gradient(circle at top, hsla(25,80%,50%,0.25), transparent 70%)" }} />
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-destructive font-semibold">Infração crítica</div>
              <DialogTitle className="font-display text-xl">{criticalIncident?.sectorName}</DialogTitle>
            </div>
          </div>
          <DialogDescription>
            Um colaborador está sem EPI obrigatório há mais de 60 segundos. Ação imediata recomendada.
          </DialogDescription>
        </DialogHeader>

        {criticalIncident && (
          <div className="space-y-3 py-2">
            <Row icon={MapPin} label="Local" value={`${criticalIncident.sectorName} · ${criticalIncident.station}`} />
            <Row icon={User} label="Colaborador" value={criticalIncident.employeeId} />
            <Row icon={ShieldOff} label="EPI removido" value={criticalIncident.epi} />
            <Row icon={Clock} label="Tempo em infração" value={`${elapsed}s`} highlight />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button variant="destructive" className="flex-1" onClick={() => criticalIncident && escalateSector(criticalIncident.sectorId)}>
            Acionar supervisor
          </Button>
          <Button variant="secondary" className="flex-1" onClick={() => criticalIncident && resolveSector(criticalIncident.sectorId)}>
            Marcar como resolvido
          </Button>
          <Button variant="ghost" onClick={acknowledgeCritical}>Ignorar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Row({ icon: Icon, label, value, highlight }: { icon: any; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-md bg-muted/40 border border-border">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className={`text-sm font-medium ${highlight ? "text-destructive" : ""}`}>{value}</div>
    </div>
  );
}
