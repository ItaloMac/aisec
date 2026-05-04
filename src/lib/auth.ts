const KEY = "aisec_auth";
const USER_KEY = "aisec_user";
const ROLE_KEY = "aisec_role";
const SECTORS_KEY = "aisec_sectors";

export type Role = "global" | "supervisor";

export function isAuthed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}
export function login(email: string, role: Role = "global", sectors: string[] = []) {
  localStorage.setItem(KEY, "1");
  localStorage.setItem(USER_KEY, email);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(SECTORS_KEY, JSON.stringify(sectors));
}
export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(SECTORS_KEY);
}
export function currentUser() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_KEY);
}
export function currentRole(): Role {
  if (typeof window === "undefined") return "global";
  return (localStorage.getItem(ROLE_KEY) as Role) || "global";
}
export function currentSectors(): string[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(SECTORS_KEY) || "[]"); } catch { return []; }
}
export function canAccessSector(sectorId: string): boolean {
  const role = currentRole();
  if (role === "global") return true;
  const allowed = currentSectors();
  return allowed.length === 0 || allowed.includes(sectorId);
}
export function isGlobal(): boolean {
  return currentRole() === "global";
}
