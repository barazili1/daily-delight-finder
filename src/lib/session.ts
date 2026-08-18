export type ActiveSession = { code: string; userId: string; expiresAt: string };

const KEY = "cvip_session";
const ID_KEY = "cvip_user_id";

export function saveSession(s: ActiveSession) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

export function readSession(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as ActiveSession;
    if (new Date(s.expiresAt).getTime() <= Date.now()) return null;
    return s;
  } catch {
    return null;
  }
}

export function saveUserId(id: string) {
  localStorage.setItem(ID_KEY, id);
}

export function readUserId() {
  return localStorage.getItem(ID_KEY) ?? "";
}
