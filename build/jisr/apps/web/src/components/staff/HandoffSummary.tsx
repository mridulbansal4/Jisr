"use client";

import { useRef, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { ApiError, api, problemMessage, type HandoffFact, type HandoffSummary as Summary } from "@/lib/api";
import { Badge, Icon, btn } from "../ui";
import { EASE } from "../motion";

const KIND_STYLE: Record<HandoffFact["kind"], { chip: string; ring: string; icon: "clipboard" | "calculator" }> = {
  observed: { chip: "bg-observed-bg text-observed border-observed/30", ring: "ring-observed", icon: "clipboard" },
  calculated: { chip: "bg-calc-bg text-calc border-calc/30", ring: "ring-calc", icon: "calculator" },
};

function SourceChip({
  id,
  kind,
  active,
  onFocus,
  onBlur,
  label,
}: {
  id: string;
  kind: HandoffFact["kind"] | undefined;
  active: boolean;
  onFocus: () => void;
  onBlur: () => void;
  label: string;
}) {
  const style = kind ? KIND_STYLE[kind].chip : "bg-surface-muted text-ink-muted border-line";
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
      onClick={onFocus}
      className={`relative -top-1.5 mx-0.5 inline-flex min-h-6 min-w-6 items-center justify-center rounded-full border px-1.5 align-baseline font-mono text-[10px] font-bold leading-none transition-all duration-200 ${style} ${
        active ? "scale-110 shadow-[var(--shadow-lift)] ring-2 ring-primary ring-offset-1 ring-offset-surface" : "hover:scale-110"
      }`}
    >
      <bdi dir="ltr">{id}</bdi>
    </button>
  );
}

export function HandoffSummary({ episodeId }: { episodeId: string }) {
  const t = useTranslations("handoff");
  const tb = useTranslations("badges");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const [data, setData] = useState<Summary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [activeFact, setActiveFact] = useState<string | null>(null);
  const [pinnedFact, setPinnedFact] = useState<string | null>(null);
  const factRefs = useRef<Record<string, HTMLLIElement | null>>({});

  async function generate() {
    setBusy(true);
    setError(null);
    setLocked(false);
    try {
      const d = await api.handoffSummary(episodeId);
      setData(d);
      setActiveFact(null);
      setPinnedFact(null);
    } catch (e) {
      if (e instanceof ApiError && e.status === 423) setLocked(true);
      else setError(`${t("failed")} (${problemMessage(e)})`);
    } finally {
      setBusy(false);
    }
  }

  const focusFact = (id: string) => {
    setActiveFact(id);
    factRefs.current[id]?.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  };
  const current = activeFact ?? pinnedFact;
  const factById = new Map((data?.facts ?? []).map((f) => [f.id, f]));
  const verified = data ? data.sentences.filter((s) => s.status === "verified").length : 0;
  const removed = data ? (data.removed_count ?? data.sentences.filter((s) => s.status === "removed").length) : 0;
  const isAi = data?.content_type === "ai_drafted";

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-ai/25 bg-surface shadow-[var(--shadow-card)]" data-content-type="ai">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ai-bg/70 to-transparent" />
      <div aria-hidden className="orb orb-indigo -end-32 -top-40 size-80 opacity-60" />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ai-bg px-2.5 py-1 text-xs font-semibold text-ai">
            <Icon name="sparkles" className="size-3.5" />
            {tb("ai")}
          </span>
          <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
          <div className="ms-auto flex flex-wrap items-center gap-2">
            {data ? (
              <motion.span
                initial={reduce ? false : { opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  removed > 0 ? "border-amber/30 bg-amber-bg text-amber" : "border-green/30 bg-green-bg text-green"
                }`}
              >
                <Icon name="shield" className="size-3.5" />
                {t("validator", { verified, removed })}
              </motion.span>
            ) : null}
            <button type="button" className={data ? btn.secondary : btn.accent} onClick={() => void generate()} disabled={busy}>
              <Icon name="sparkles" />
              {busy ? t("generating") : data ? t("regenerate") : t("generate")}
            </button>
          </div>
        </div>

        {error ? <p className="mt-4 rounded-2xl border border-red/30 bg-red-bg px-4 py-3 text-sm text-red">{error}</p> : null}
        {locked ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-help">
            <Icon name="lock" />
            {t("lockedRed")}
          </p>
        ) : null}

        {!data && !busy && !locked ? <p className="mt-4 text-ink-muted">{t("empty")}</p> : null}
        {busy && !data ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="space-y-3">
              <div className="skeleton h-5 w-11/12" />
              <div className="skeleton h-5 w-9/12" />
              <div className="skeleton h-5 w-10/12" />
            </div>
            <div className="skeleton h-32" />
          </div>
        ) : null}

        {data ? (
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
            {/* AI-drafted sentences */}
            <div className="rounded-[22px] border border-dashed border-ai/40 bg-ai-bg/30 p-4 sm:p-5">
              <ol className="space-y-3 text-[15px] leading-relaxed">
                {data.sentences.map((s, i) => {
                  const lit = current !== null && s.sources.includes(current);
                  const dim = current !== null && !lit;
                  return (
                    <motion.li
                      key={`${i}-${s.text.slice(0, 12)}`}
                      initial={reduce ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
                      animate={{ opacity: dim ? 0.45 : 1, y: 0, filter: "blur(0px)" }}
                      transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : i * 0.12 }}
                      className={`rounded-xl px-2 py-1 transition-colors duration-200 ${lit ? "bg-primary-soft" : ""}`}
                    >
                      {s.status === "removed" ? (
                        <>
                          <span className="text-ink-muted line-through decoration-red/70 decoration-2">{s.text}</span>
                          <span className="mt-1 flex items-center gap-1.5 text-xs font-medium text-red">
                            <Icon name="x" className="size-3.5" />
                            {s.reason ? t("removedReason", { reason: s.reason }) : t("removedDefault")}
                          </span>
                        </>
                      ) : (
                        <span>{s.text}</span>
                      )}
                      {s.sources.map((id) => (
                        <SourceChip
                          key={id}
                          id={id}
                          kind={factById.get(id)?.kind}
                          active={current === id}
                          label={`${t("source", { id })}: ${factById.get(id)?.label ?? ""}`}
                          onFocus={() => focusFact(id)}
                          onBlur={() => setActiveFact(null)}
                        />
                      ))}
                    </motion.li>
                  );
                })}
              </ol>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-ai/20 pt-3 text-xs text-ink-muted">
                {isAi ? (
                  <Badge tone="ai">
                    <Icon name="sparkles" className="size-3" />
                    {tb("ai")}
                  </Badge>
                ) : (
                  <Badge>{t("template")}</Badge>
                )}
                <span className="font-mono">{t("provider", { provider: data.provider })}</span>
                <span>·</span>
                <span>{t("generated", { time: format.dateTime(new Date(data.generated_at), { hour: "2-digit", minute: "2-digit", second: "2-digit" }) })}</span>
              </div>
            </div>

            {/* Facts: observed / calculated, never mixed with AI text */}
            <aside aria-label={t("factsTitle")}>
              <h3 className="text-sm font-semibold">{t("factsTitle")}</h3>
              <p className="mb-3 text-xs text-ink-muted">{t("factsHint")}</p>
              <ul className="max-h-[26rem] space-y-2 overflow-y-auto pe-1">
                {data.facts.map((f) => {
                  const on = current === f.id;
                  const st = KIND_STYLE[f.kind] ?? KIND_STYLE.calculated;
                  return (
                    <li
                      key={f.id}
                      ref={(el) => {
                        factRefs.current[f.id] = el;
                      }}
                    >
                      <button
                        type="button"
                        onMouseEnter={() => setActiveFact(f.id)}
                        onMouseLeave={() => setActiveFact(null)}
                        onClick={() => setPinnedFact((p) => (p === f.id ? null : f.id))}
                        aria-pressed={pinnedFact === f.id}
                        className={`w-full rounded-2xl border bg-surface p-3 text-start transition-all duration-200 ${
                          on ? "-translate-y-0.5 border-primary shadow-[var(--shadow-lift)] ring-2 ring-primary/30" : "border-line hover:border-line-strong"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`inline-flex items-center rounded-full border px-1.5 font-mono text-[10px] font-bold ${st.chip}`}>
                            <bdi dir="ltr">{f.id}</bdi>
                          </span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${f.kind === "observed" ? "text-observed" : "text-calc"}`}>
                            <Icon name={st.icon} className="size-3" />
                            {f.kind === "observed" ? tb("observed") : tb("calculated")}
                          </span>
                        </span>
                        <span className="mt-1.5 block text-xs text-ink-muted">{f.label}</span>
                        <span className="block font-semibold tabular">{f.value}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        ) : null}
      </div>
    </section>
  );
}
