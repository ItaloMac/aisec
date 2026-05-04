export type Sector = {
  id: string;
  name: string;
  zone: string;
  // SVG plant coordinates (viewBox 0 0 1000 600)
  x: number;
  y: number;
  w: number;
  h: number;
  workers: number;
};

export const SECTORS: Sector[] = [
  { id: "solda",     name: "Solda",          zone: "Bloco A", x: 40,  y: 40,  w: 260, h: 180, workers: 8 },
  { id: "pintura",   name: "Pintura",        zone: "Bloco A", x: 320, y: 40,  w: 220, h: 180, workers: 6 },
  { id: "montagem-a",name: "Montagem A",     zone: "Bloco B", x: 560, y: 40,  w: 180, h: 180, workers: 12 },
  { id: "montagem-b",name: "Montagem B",     zone: "Bloco B", x: 760, y: 40,  w: 200, h: 180, workers: 10 },
  { id: "caldeira",  name: "Caldeira",       zone: "Bloco C", x: 40,  y: 240, w: 200, h: 160, workers: 4 },
  { id: "estoque",   name: "Estoque",        zone: "Bloco C", x: 260, y: 240, w: 280, h: 160, workers: 7 },
  { id: "embalagem", name: "Embalagem",      zone: "Bloco D", x: 560, y: 240, w: 220, h: 160, workers: 9 },
  { id: "expedicao", name: "Expedição",      zone: "Bloco D", x: 800, y: 240, w: 160, h: 160, workers: 5 },
];

export const EPIS = ["Capacete", "Luva", "Óculos de proteção", "Protetor auricular", "Botina", "Máscara"];
export const STATIONS = ["Estação 1", "Estação 2", "Estação 3", "Estação 4", "Estação 5"];

export function randomEmployeeId() {
  return "EMP-" + Math.floor(1000 + Math.random() * 9000);
}
export function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }
