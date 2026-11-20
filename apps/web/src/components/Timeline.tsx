"use client";

import { useFormatter, useTranslations } from "next-intl";
import type { TimelineEvent } from "@/lib/api";

export function Timeline({ events, showType = false }: { events: TimelineEvent[]; showType?: boolean }) {
  const ts = useTranslations("states");
  const ta = useTranslations("actors");
  const format = useFormatter();
  const sorted = [...events].sort((a, b) => b.seq - a.seq);
  return (
    <ol className="space-y-3 border-s-2 border-line ps-4">
      {sorted.map((ev) => (
        <li key={ev.seq} className="relative">
          <span aria-hidden className="absolute -start-[1.4rem] top-1.5 size-2.5 rounded-full border-2 border-ink-muted bg-surface" />
          <p className="font-medium">
            {ev.to_state && ts.has(ev.to_state as never) ? ts(ev.to_state as never) : ev.type.replaceAll("_", " ").toLowerCase()}
          </p>
          <p className="text-sm text-ink-muted">
            <time dateTime={ev.occurred_at} className="tabular">
              {format.dateTime(new Date(ev.occurred_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: showType ? "2-digit" : undefined })}
            </time>
            {" · "}
            {ta.has(ev.actor_type as never) ? ta(ev.actor_type as never) : ev.actor_type}
            {showType ? (
              <>
                {" · "}
                <span className="font-mono text-xs">
                  <bdi dir="ltr">
                    #{ev.seq} {ev.type}
                    {ev.from_state && ev.to_state ? ` ${ev.from_state}→${ev.to_state}` : ""}
                  </bdi>
                </span>
              </>
            ) : null}
          </p>
        </li>
      ))}
    </ol>
  );
}
