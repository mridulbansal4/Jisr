"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { SESSION_EVENT, readRaw, type AuthState } from "./session";

function subscribe(cb: () => void): () => void {
  window.addEventListener(SESSION_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(SESSION_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Reads a sessionStorage key reactively; null during SSR. */
export function useSessionJson<T>(key: string): T | null {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => null,
  );
  return useMemo(() => {
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [raw]);
}

export function useAuth(): AuthState | null {
  // Expiry is enforced by getAuth() before each request and by 401 handling.
  return useSessionJson<AuthState>("auth");
}

/** True after hydration: lets client-only UI (sessionStorage) avoid SSR mismatch. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/** A ticking clock for countdowns. */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
