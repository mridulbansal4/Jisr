"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, problemMessage, type QueueItem, type QueuePage, type QueueView as View } from "@/lib/api";
import { isUnackedRed, sortQueue } from "@/lib/sla";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Badge, Icon, Spinner, btn } from "../ui";
import { Alert } from "../ui";
import { CountUp, EASE } from "../motion";
import { SlaCountdown, SlaRing } from "./SlaCountdown";

const VIEWS: View[] = ["all", "red", "overdue", "to_confirm", "mine"];

function StatusBadge({ item }: { item: QueueItem }) {
  const t = useTranslations("staff");
  if (item.is_red)
    return (
      <Badge tone="red">
        <span aria-hidden className="size-1.5 animate-pulse-soft rounded-full bg-red" />
        {t("red")}
      </Badge>
    );
  if (item.deadline?.overdue)
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-bg px-2.5 py-0.5 text-xs font-semibold text-amber">
        <Icon name="clock" className="size-3" />
        {t("overdueTag")}
      </span>
    );
  return <Badge>{t("waiting")}</Badge>;
}

function CountTile({ label, value, tone }: { label: string; value: number; tone: "red" | "amber" | "primary" | "neutral" }) {
  const cls = { red: "text-red", amber: "text-amber", primary: "text-primary", neutral: "text-ink" }[tone];
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <p className={`headline mt-1 text-3xl ${cls}`}>
        <CountUp value={value} duration={0.8} />
      </p>
    </div>
  );
}

export function QueueView() {
  const t = useTranslations("staff");
  const ts = useTranslations("states");
  const tc = useTranslations("common");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const [view, setView] = useState<View>("all");
  const [page, setPage] = useState<QueuePage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);

  const load = useCallback(
    (v: View) =>
      api.getQueue(v).then(
        (p) => {
          setPage(p);
          setError(null);
          setUpdatedAt(Date.now());
        },
        (e: unknown) => setError(problemMessage(e)),
      ),
    [],
  );

  useEffect(() => {
    void load(view);
    const id = setInterval(() => void load(view), 5000);
    return () => clearInterval(id);
  }, [view, load]);

  const items = page ? sortQueue(page.items) : [];
  const unackedRed = items.filter(isUnackedRed);
  const href = (i: QueueItem) => `/staff/episode/${i.episode_id}?label=${encodeURIComponent(i.person_label)}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="headline text-3xl sm:text-4xl">{t("queue")}</h1>
        {updatedAt ? (
          <p className="flex items-center gap-2 text-xs text-ink-muted">
            <span aria-hidden className="size-2 animate-pulse-soft rounded-full bg-green" />
            {t("lastUpdated", { time: format.dateTime(new Date(updatedAt), { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })}
          </p>
        ) : null}
      </div>

      {page ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <CountTile label={t("views.red")} value={page.counts.red ?? items.filter((i) => i.is_red).length} tone="red" />
          <CountTile label={t("views.overdue")} value={page.counts.overdue ?? 0} tone="amber" />
          <CountTile label={t("views.to_confirm")} value={page.counts.to_confirm ?? 0} tone="primary" />
          <CountTile label={t("views.all")} value={items.length} tone="neutral" />
        </div>
      ) : null}

      <AnimatePresence>
        {unackedRed.length > 0 ? (
          <motion.div
            role="status"
            initial={reduce ? false : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="relative flex flex-wrap items-center gap-4 overflow-hidden rounded-[24px] border-2 border-red bg-red-bg px-5 py-4 text-red"
          >
            <SlaRing deadline={unackedRed[0].deadline} size={72} />
            <div className="flex-1">
              <p className="text-lg font-semibold">{t("redBanner", { count: unackedRed.length })}</p>
              <p className="text-sm">
                <bdi>{unackedRed[0].person_label}</bdi> · {unackedRed[0].reason}
              </p>
            </div>
            <Link href={href(unackedRed[0])} className={btn.danger}>
              {t("openNow")}
              <Icon name="arrow" className="size-4 rtl:rotate-180" />
            </Link>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div role="tablist" aria-label={t("queue")} className="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1">
        {VIEWS.map((v) => (
          <button
            key={v}
            role="tab"
            type="button"
            aria-selected={view === v}
            onClick={() => setView(v)}
            className={`min-h-10 rounded-full px-4 text-sm font-medium transition-colors ${view === v ? "bg-pill text-on-pill" : "text-ink-muted hover:bg-surface-muted"}`}
          >
            {t(`views.${v}`)}
            {v !== "all" && v !== "mine" && page?.counts?.[v] !== undefined ? <span className="ms-1.5 tabular opacity-70">{page.counts[v]}</span> : null}
          </button>
        ))}
      </div>

      {error ? <Alert tone="warn">{`${t("pollError")} (${error})`}</Alert> : null}
      {!page && !error ? <Spinner label={tc("loading")} /> : null}
      {page && items.length === 0 ? <p className="card p-10 text-center text-ink-muted">{t("empty")}</p> : null}

      {items.length > 0 ? (
        <ul className="grid gap-3">
          <AnimatePresence initial={false}>
            {items.map((i) => (
              <motion.li key={i.episode_id} layout={!reduce} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                <div className={`card lift flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap ${i.is_red ? "border-red/40 bg-red-bg/30" : ""}`}>
                  <SlaRing deadline={i.deadline} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge item={i} />
                      <span className="font-semibold">
                        <bdi>{i.person_label}</bdi>
                      </span>
                      {i.language ? <span className="rounded-full border border-line px-1.5 text-[11px] font-semibold text-ink-muted">{i.language.toUpperCase()}</span> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-ink-muted">{i.reason}</p>
                  </div>
                  <div className="hidden flex-col items-end gap-1 text-end md:flex">
                    <span className="rounded-full bg-primary-soft px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">{i.step ?? "n/a"}</span>
                    <span className="text-xs text-ink-muted">{ts.has(i.state as never) ? ts(i.state as never) : i.state}</span>
                  </div>
                  <div className="hidden lg:block">
                    <SlaCountdown deadline={i.deadline} />
                  </div>
                  <Link href={href(i)} className={i.is_red ? btn.danger : btn.secondary}>
                    {t("open")}
                  </Link>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : null}
    </div>
  );
}
