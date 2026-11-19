"use client";

import { api } from "./api";
import { K, getAuth, readJson, writeJson } from "./session";

/** Public demo passcode (addendum default); NEXT_PUBLIC_JUDGE_PASSCODE overrides it. */
export const DEFAULT_PASSCODE = process.env.NEXT_PUBLIC_JUDGE_PASSCODE || "jisr-demo";

export function currentPasscode(): string {
  return readJson<string>(K.passcode) || DEFAULT_PASSCODE;
}

interface JudgeTok {
  token: string;
  expiresAt: number;
}

let inflight: Promise<string> | null = null;

/**
 * A read-only judge token for aggregate pages (landing stats, Safety, Programme
 * when viewed by a judge). Kept in sessionStorage, separate from the persona
 * session so it never changes who the person is signed in as.
 */
export async function judgeToken(): Promise<string> {
  const cached = readJson<JudgeTok>("judgeToken");
  if (cached && cached.expiresAt > Date.now() + 30000) return cached.token;
  if (inflight) return inflight;
  inflight = api
    .demoLogin("judge", currentPasscode())
    .then((t) => {
      writeJson("judgeToken", { token: t.access_token, expiresAt: Date.now() + Math.max(60, t.expires_in) * 1000 });
      return t.access_token;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

/** Use the signed-in token when its role may read aggregates; otherwise a judge token. */
export async function aggregateToken(allowed: string[] = ["programme", "judge", "clinician", "coordinator"]): Promise<string> {
  const a = getAuth();
  if (a && allowed.includes(a.role)) return a.token;
  return judgeToken();
}
