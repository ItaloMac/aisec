import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { SECTORS, EPIS, STATIONS, pick, randomEmployeeId, type Sector } from "@/lib/sectors";
import { ALERT_THRESHOLD } from "@/lib/risk";

export type Incident = {
  id: string;
  sectorId: string;
  sectorName: string;
  station: string;
  employeeId: string;
  epi: string;
  startedAt: number;
  resolvedAt?: number;
  escalated: boolean;
};

export type SectorState = {
  sector: Sector;
  active: boolean;
  seconds: number;
  incident?: Incident;
};

type Ctx = {
  states: Record<string, SectorState>;
  history: Incident[];
  metrics: {
    accidentsAvoided: number;
    monthAvoided: number;
    compliance: number;
    last24h: number;
    activeAlerts: number;
  };
  criticalIncident: Incident | null;
  acknowledgeCritical: () => void;
  resolveSector: (id: string) => void;
  escalateSector: (id: string) => void;
  triggerSector: (id: string) => void;
};

const SimCtx = createContext<Ctx | null>(null);

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Record<string, SectorState>>(() => {
    const o: Record<string, SectorState> = {};
    for (const s of SECTORS) o[s.id] = { sector: s, active: false, seconds: 0 };
    return o;
  });
  const [history, setHistory] = useState<Incident[]>(() => seedHistory());
  const [criticalIncident, setCriticalIncident] = useState<Incident | null>(null);
  const criticalShownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const t = setInterval(() => {
      setStates((prev) => {
        const next: Record<string, SectorState> = { ...prev };
        for (const id of Object.keys(next)) {
          const st = next[id];
          if (st.active) {
            const seconds = st.seconds + 1;
            next[id] = { ...st, seconds };
            if (seconds >= ALERT_THRESHOLD && st.incident && !criticalShownRef.current.has(st.incident.id)) {
              criticalShownRef.current.add(st.incident.id);
              setCriticalIncident(st.incident);
            }
          } else {
            // chance to start a new incident
            if (Math.random() < 0.04) {
              const incident: Incident = {
                id: crypto.randomUUID(),
                sectorId: st.sector.id,
                sectorName: st.sector.name,
                station: pick(STATIONS),
                employeeId: randomEmployeeId(),
                epi: pick(EPIS),
                startedAt: Date.now(),
                escalated: false,
              };
              next[id] = { ...st, active: true, seconds: 1, incident };
            }
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const finishIncident = (id: string, escalated: boolean) => {
    setStates((prev) => {
      const st = prev[id];
      if (!st || !st.incident) return prev;
      const finished: Incident = { ...st.incident, resolvedAt: Date.now(), escalated };
      setHistory((h) => [finished, ...h].slice(0, 100));
      return { ...prev, [id]: { sector: st.sector, active: false, seconds: 0 } };
    });
  };

  const ctx: Ctx = {
    states,
    history,
    criticalIncident,
    acknowledgeCritical: () => setCriticalIncident(null),
    resolveSector: (id) => { finishIncident(id, false); setCriticalIncident(null); },
    escalateSector: (id) => { finishIncident(id, true); setCriticalIncident(null); },
    triggerSector: (id) => {
      setStates((prev) => {
        const st = prev[id];
        if (!st || st.active) return prev;
        const incident: Incident = {
          id: crypto.randomUUID(),
          sectorId: st.sector.id,
          sectorName: st.sector.name,
          station: pick(STATIONS),
          employeeId: randomEmployeeId(),
          epi: pick(EPIS),
          startedAt: Date.now(),
          escalated: false,
        };
        return { ...prev, [id]: { ...st, active: true, seconds: 1, incident } };
      });
    },
    metrics: computeMetrics(history, states),
  };

  return <SimCtx.Provider value={ctx}>{children}</SimCtx.Provider>;
}

export function useSim() {
  const c = useContext(SimCtx);
  if (!c) throw new Error("useSim must be used inside SimulationProvider");
  return c;
}

function computeMetrics(history: Incident[], states: Record<string, SectorState>) {
  const now = Date.now();
  const last24h = history.filter((i) => now - (i.resolvedAt ?? i.startedAt) < 86_400_000).length;
  const activeAlerts = Object.values(states).filter((s) => s.active && s.seconds >= ALERT_THRESHOLD * 0.7).length;
  const monthAvoided = history.filter((i) => !i.escalated).length;
  return {
    accidentsAvoided: 1247 + monthAvoided,
    monthAvoided: 184 + monthAvoided,
    compliance: Math.max(82, 98 - activeAlerts * 2),
    last24h: 12 + last24h,
    activeAlerts,
  };
}

function seedHistory(): Incident[] {
  const out: Incident[] = [];
  const now = Date.now();
  for (let i = 0; i < 8; i++) {
    const s = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    out.push({
      id: crypto.randomUUID(),
      sectorId: s.id,
      sectorName: s.name,
      station: pick(STATIONS),
      employeeId: randomEmployeeId(),
      epi: pick(EPIS),
      startedAt: now - (i + 1) * 1800_000,
      resolvedAt: now - (i + 1) * 1800_000 + 45_000,
      escalated: Math.random() < 0.2,
    });
  }
  return out;
}
