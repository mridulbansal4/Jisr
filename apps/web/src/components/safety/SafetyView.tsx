"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, problemMessage, type CrisisEval } from "@/lib/api";
import { aggregateToken } from "@/lib/judge";
import { Link } from "@/i18n/navigation";
import { Aurora, CountUp, Reveal, motion, useReducedMotion } from "../motion";
import { PALETTE, tooltipStyle } from "../charts/common";
import { Badge, Icon, btn } from "../ui";

function Ring({ value, label, sub, color, run }: { value: number; label: string; sub: string; color: string; run: number }) {
  const reduce = useReducedMotion();
  const R = 58;
  const C = 2 * Math.PI * R;
  return (
    <div className="card flex flex-col items-center p-6 text-center">
      <div className="relative size-40">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-muted)" strokeWidth={12} />
          <motion.circle
            key={run}
            cx="70"
            cy="70"
            r={R}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={C}
            initial={reduce ? false : { strokeDashoffset: C }}
            animate={{ strokeDashoffset: C * (1 - value) }}
            transition={{ duration: 1.4, ease: [0.2, 0.8, 0.2, 1] }}
          />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="headline text-4xl" key={run}>
            <CountUp value={value * 100} decimals={value === 1 ? 0 : 1} format={(n) => `${n.toFixed(value === 1 ? 0 : 1)}%`} />
          </span>
        </span>
      </div>
      <p className="mt-3 text-lg font-semibold">{label}</p>
      <p className="text-sm text-ink-muted">{sub}</p>
    </div>
  );
}

export function SafetyView() {
  const t = useTranslations("safety");
  const tc = useTranslations("common");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const [data, setData] = useState<CrisisEval | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [run, setRun] = useState(0);

  useEffect(() => {
    let cancelled = false;
    aggregateToken()
      .then((tok) => api.getCrisisEval(tok))
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  async function runLive() {
    setBusy(true);
    setError(null);
    try {
      const tok = await aggregateToken();
      const d = await api.runCrisisEval(tok);
      setData(d);
      setRun((r) => r + 1);
    } catch (e) {
      setError(`${t("failed")} (${problemMessage(e)})`);
    } finally {
      setBusy(false);
    }
  }

  const lang = (l: string) => (t.has(`langs.${l}` as never) ? t(`langs.${l}` as never) : l);
  const bars = (data?.by_language ?? []).map((b) => ({ lang: lang(b.lang), recall: b.recall === null ? null : b.recall * 100, precision: b.precision === null ? null : b.precision * 100, n: b.n }));

  return (
    <main id="main" className="relative isolate overflow-hidden">
      <Aurora variant="soft" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-12">
        <Link href="/" className={`${btn.ghost} px-0`}>
          <span aria-hidden className="rtl:rotate-180">←</span> {tc("appName")}
        </Link>
        <Reveal className="mt-4 flex flex-wrap items-end gap-6">
          <div className="max-w-3xl flex-1">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="headline mt-3 text-4xl sm:text-6xl">{t("title")}</h1>
            <p className="mt-4 text-lg text-ink-muted">{t("sub")}</p>
          </div>
          <button type="button" className={`${btn.primary} relative overflow-hidden`} onClick={() => void runLive()} disabled={busy}>
            {busy && !reduce ? (
              <motion.span aria-hidden className="absolute inset-y-0 w-1/3 bg-white/20" initial={{ left: "-35%" }} animate={{ left: "105%" }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
            ) : null}
            <Icon name="zap" />
            {busy ? t("running") : t("run")}
          </button>
        </Reveal>

        {error ? <p className="mt-6 rounded-2xl border border-red/30 bg-red-bg px-4 py-3 text-sm text-red">{error}</p> : null}
        {!data && !error ? <div className="skeleton mt-8 h-64" /> : null}

        {data ? (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <Badge tone="ok">
                <Icon name="check" className="size-3" />
                {t("cases", { n: data.n, pos: data.positives, neg: data.negatives })}
              </Badge>
              <span>{t("ranAt", { time: format.dateTime(new Date(data.ran_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) })}</span>
              <span className="font-mono text-xs">
                <bdi dir="ltr">{t("rules", { v: data.rules_version })}</bdi>
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Ring value={data.recall} label={t("recall")} sub={t("target")} color="var(--status-green-fg)" run={run} />
              <Ring value={data.precision} label={t("precision")} sub={`${t("fp")}: ${data.false_positives.length}`} color={PALETTE.jisr} run={run} />
              <div className="card flex flex-col items-center justify-center p-6 text-center">
                <Icon name="clock" className="size-6 text-ink-faint" />
                <p className="headline mt-3 text-5xl">
                  <CountUp key={run} value={data.latency_p95_ms} decimals={data.latency_p95_ms < 1 ? 2 : data.latency_p95_ms < 10 ? 1 : 0} />
                  <span className="ms-1 text-2xl text-ink-muted">ms</span>
                </p>
                <p className="mt-3 text-lg font-semibold">{t("latency")}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <section className="card p-6">
                <h2 className="text-lg font-semibold tracking-tight">{t("byLang")}</h2>
                <div dir="ltr" className="mt-4 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart key={run} data={bars} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis dataKey="lang" tickLine={false} axisLine={false} />
                      <YAxis tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                      <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-muted)" }} formatter={(v) => (v == null ? "n/a" : `${Number(v).toFixed(1)}%`)} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="recall" name={t("recall")} fill="var(--status-green-fg)" radius={[8, 8, 0, 0]} maxBarSize={36} isAnimationActive={!reduce} animationDuration={900} />
                      <Bar dataKey="precision" name={t("precision")} fill={PALETTE.jisr} radius={[8, 8, 0, 0]} maxBarSize={36} isAnimationActive={!reduce} animationDuration={900} animationBegin={150} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-xs text-ink-muted">{(data.by_language ?? []).map((b) => `${lang(b.lang)} n=${b.n}`).join(" · ")}</p>
                {data.by_category && data.by_category.length > 0 ? (
                  <>
                    <h3 className="mt-5 text-sm font-semibold">{t("byCategory")}</h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {data.by_category.map((c) => (
                        <li key={c.category} className="rounded-full border border-line bg-surface-muted px-2.5 py-1 text-xs">
                          {c.category.replaceAll("_", " ").toLowerCase()}{" "}
                          {c.correct != null ? (
                            <strong className="tabular text-green">
                              <bdi dir="ltr">{`${c.correct}/${c.n}`}</bdi>
                            </strong>
                          ) : c.recall != null ? (
                            <strong className="tabular text-green">{Math.round(c.recall * 100)}%</strong>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </section>
              <section className="card p-6">
                <h2 className="text-lg font-semibold tracking-tight">{t("fn")}</h2>
                {data.false_negatives.length === 0 ? (
                  <p className="mt-2 flex items-center gap-2 text-green">
                    <Icon name="check" />
                    {t("fnNone")}
                  </p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {data.false_negatives.map((c) => (
                      <li key={c.id} className="rounded-2xl border border-red/30 bg-red-bg p-3 text-sm">
                        <span className="font-mono text-xs">{c.id} · {lang(c.lang)}</span>
                        <p dir="auto">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <h2 className="mt-6 text-lg font-semibold tracking-tight">{t("fp")}</h2>
                <p className="text-xs text-ink-muted">{t("fpNote")}</p>
                {data.false_positives.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">{t("fnNone")}</p>
                ) : (
                  <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {data.false_positives.map((c) => (
                      <li key={c.id} className="rounded-2xl border border-line bg-surface-muted p-3 text-sm">
                        <span className="font-mono text-xs text-ink-muted">
                          {c.id} · {lang(c.lang)}
                        </span>
                        <p dir="auto">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
            <p className="mt-4 text-xs text-ink-muted">{t("onlyApi")}</p>
          </>
        ) : null}
      </div>
    </main>
  );
}
