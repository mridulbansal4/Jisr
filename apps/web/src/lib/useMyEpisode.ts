"use client";

import { useEffect, useState } from "react";
import { api } from "./api";
import { useSessionJson } from "./hooks";
import { K, writeJson } from "./session";

/**
 * The person's current episode id: the one this tab created, else the newest
 * from GET /v1/me/episodes (e.g. Imran's seeded episode). `undefined` while loading.
 */
export function useMyEpisodeId(): string | null | undefined {
  const stored = useSessionJson<string>(K.episodeId);
  const [fetched, setFetched] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (stored) return;
    let cancelled = false;
    api
      .myEpisodes()
      .then((r) => {
        if (cancelled) return;
        const id = r.items[0]?.id ?? null;
        setFetched(id);
        if (id) writeJson(K.episodeId, id);
      })
      .catch(() => !cancelled && setFetched(null));
    return () => {
      cancelled = true;
    };
  }, [stored]);
  return stored ?? fetched;
}
