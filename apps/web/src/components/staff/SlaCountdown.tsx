"use client";

import { useTranslations } from "next-intl";
import type { Deadline } from "@/lib/api";
import { useNow } from "@/lib/hooks";
import { RED_ACK_MS, formatRemaining, slaTone } from "@/lib/sla";
import { Icon } from "../ui";

export const DEFAULT_TOTAL_MS: Record<Deadline["kind"], number> = {
  crisis_ack: RED_ACK_MS,
  referral_accept: 48 * 3600 * 1000,
  first_appt: 14 * 24 * 3600 * 1000,
  recheck: 14 * 24 * 3600 * 1000,
};

function useSla(deadline: Deadline) {
  const now = useNow(1000);
  const remaining = Date.parse(deadline.due_at) - now;
  const total = DEFAULT_TOTAL_MS[deadline.kind];
  const { text, overdue } = formatRemaining(remaining);
  const tone = deadline.overdue && remaining > 0 ? "red" : slaTone(remaining, total);
  return { remaining, total, text, overdue, tone };
}

export function SlaCountdown({ deadline, large = false }: { deadline: Deadline | null | undefined; large?: boolean }) {
  const t = useTranslations("staff");
  if (!deadline) return <span className="text-ink-muted">{t("noDeadline")}</span>;
  return <SlaPill deadline={deadline} large={large} />;
}

function SlaPill({ deadline, large }: { deadline: Deadline; large: boolean }) {
  const t = useTranslations("staff");
  const { text, overdue, tone } = useSla(deadline);
  const cls = tone === "red" ? "bg-red-bg text-red" : tone === "amber" ? "bg-amber-bg text-amber" : "bg-surface-muted text-ink";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold tabular ${cls} ${large ? "text-2xl" : "text-sm"}`} role="timer" aria-live="off">
      <Icon name="clock" className={large ? "size-6" : "size-4"} />
      <bdi dir="ltr">{overdue ? t("overdue", { time: text }) : t("left", { time: text })}</bdi>
    </span>
  );
}

/** Circular SLA ring: the arc is the share of the window still remaining. */
export function SlaRing({ deadline, size = 64 }: { deadline: Deadline | null | undefined; size?: number }) {
  const t = useTranslations("staff");
  if (!deadline)
    return (
      <span aria-label={t("noDeadline")} className="inline-flex shrink-0 items-center justify-center rounded-full border-[5px] border-surface-muted text-xs text-ink-faint" style={{ width: size, height: size }}>
        n/a
      </span>
    );
  return <Ring deadline={deadline} size={size} />;
}

function Ring({ deadline, size }: { deadline: Deadline; size: number }) {
  const t = useTranslations("staff");
  const { remaining, total, text, overdue, tone } = useSla(deadline);
  const frac = overdue ? 1 : Math.max(0, Math.min(1, remaining / total));
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const abs = Math.abs(remaining);
  const compact = abs >= 86400000 ? `${Math.floor(abs / 86400000)}d` : abs >= 3600000 ? `${Math.floor(abs / 3600000)}h` : text;
  const color = tone === "red" || deadline.kind === "crisis_ack" ? "var(--status-red-fg)" : tone === "amber" ? "var(--status-amber-fg)" : "var(--primary)";
  return (
    <span role="timer" aria-live="off" aria-label={overdue ? t("overdue", { time: text }) : t("left", { time: text })} className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-muted)" strokeWidth={5} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
          className={overdue ? "animate-pulse-soft" : ""}
        />
      </svg>
      <bdi dir="ltr" className="absolute text-[11px] font-bold tabular" style={{ color }}>
        {overdue ? `+${compact}` : compact}
      </bdi>
    </span>
  );
}
