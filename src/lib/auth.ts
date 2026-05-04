const KEY = "aisec_auth";

export function isAuthed() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(KEY) === "1";
}
export function login(email: string) {
  localStorage.setItem(KEY, "1");
  localStorage.setItem("aisec_user", email);
}
export function logout() {
  localStorage.removeItem(KEY);
  localStorage.removeItem("aisec_user");
}
export function currentUser() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("aisec_user");
}
