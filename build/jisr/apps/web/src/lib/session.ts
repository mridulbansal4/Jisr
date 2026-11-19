/**
 * Tab-scoped session state. sessionStorage only (never localStorage): the
 * token and any screening context vanish when the tab closes or on quick exit.
 */

const PREFIX = "jisr.";

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readJson<T>(key: string): T | null {
  const s = store();
  if (!s) return null;
  try {
    const raw = s.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  const s = store();
  if (!s) return;
  try {
    if (value === null || value === undefined) s.removeItem(PREFIX + key);
    else s.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* storage full or blocked: the demo still works in memory for this page */
  }
  notify();
}

export const SESSION_EVENT = "jisr-session";

function notify(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Raw string snapshot (stable for useSyncExternalStore). */
export function readRaw(key: string): string | null {
  const s = store();
  if (!s) return null;
  try {
    return s.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export interface AuthState {
  token: string;
  role: string;
  persona: string;
  expiresAt: number;
}

export function getAuth(): AuthState | null {
  const a = readJson<AuthState>("auth");
  if (!a) return null;
  if (a.expiresAt && Date.now() > a.expiresAt) {
    writeJson("auth", null);
    return null;
  }
  return a;
}

export function setAuth(a: AuthState): void {
  writeJson("auth", a);
}

export function setAuthFromToken(tok: { access_token: string; role: string; persona?: string; expires_in: number }, persona: string): void {
  setAuth({
    token: tok.access_token,
    role: tok.role,
    persona: tok.persona ?? persona,
    expiresAt: Date.now() + Math.max(60, tok.expires_in) * 1000,
  });
}

export function getToken(): string | null {
  return getAuth()?.token ?? null;
}

/** Clears everything Jisr keeps in this tab. */
export function clearSession(opts: { keepPasscode?: boolean } = {}): void {
  const s = store();
  if (!s) return;
  const passcode = opts.keepPasscode ? s.getItem(PREFIX + "passcode") : null;
  try {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(PREFIX)) keys.push(k);
    }
    keys.forEach((k) => s.removeItem(k));
    if (passcode) s.setItem(PREFIX + "passcode", passcode);
  } catch {
    /* ignore */
  }
  notify();
}

/** Person-flow keys, kept in one place so quick exit clears them all. */
export const K = {
  passcode: "passcode",
  completion: "person.completion",
  answers: "person.answers",
  episodeId: "person.episodeId",
  provider: "person.provider",
  llmLocked: "person.llmLocked",
  discreet: "person.discreet",
  referral: (episodeId: string) => `referral.${episodeId}`,
} as const;

/** Clears the person's screening/booking context but keeps auth, passcode and referral ids. */
export function clearPersonFlow(): void {
  const s = store();
  if (!s) return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < s.length; i++) {
      const k = s.key(i);
      if (k && k.startsWith(PREFIX + "person.")) keys.push(k);
    }
    keys.forEach((k) => s.removeItem(k));
  } catch {
    /* ignore */
  }
  notify();
}

export function homeForRole(role: string): "/me" | "/staff" | "/programme" {
  if (role === "person") return "/me";
  if (role === "clinician" || role === "coordinator") return "/staff";
  return "/programme";
}
