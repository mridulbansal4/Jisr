"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, problemMessage, type CrisisEval } from "@/lib/api";
import { aggregateToken } from "@/lib/judge";
import { Link } from "@/i18n/navigation";
import { Reveal } from "../motion";
import { PALETTE, tooltipStyle } from "../charts/common";
import { Icon, btn } from "../ui";

function Ring({ value, label, sub, color }: { value: number; label: string; sub: string; color: string }) {
  const R = 58;
  const C = 2 * Math.PI * R;
  return (
    <div className="card flex flex-col items-center p-6 text-center">
      <div className="relative size-40">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" aria-hidden>
          <circle cx="70" cy="70" r={R} fill="none" stroke="var(--surface-muted)" strokeWidth={6} />
          <circle cx="70" cy="70" r={R} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - value)} />
        </svg>
        <span className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="headline tabular text-4xl">{`${(value * 100).toFixed(value === 1 ? 0 : 1)}%`}</span>
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
    <main id="main">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12">
        <Link href="/" className={`${btn.ghost} px-0`}>
          <span aria-hidden className="rtl:rotate-180">←</span> {tc("appName")}
        </Link>
        <Reveal className="mt-4 flex flex-wrap items-end gap-6">
          <div className="max-w-3xl flex-1">
            <p className="eyebrow">{t("eyebrow")}</p>
            <h1 className="display mt-3 text-[2.75rem] sm:text-6xl">{t("title")}</h1>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t("sub")}</p>
          </div>
          <button type="button" className={btn.primary} onClick={() => void runLive()} disabled={busy}>
            {busy ? t("running") : t("run")}
          </button>
        </Reveal>

        {error ? <p className="mt-6 rounded-lg border border-red/30 bg-red-bg px-4 py-3 text-sm text-red">{error}</p> : null}
        {!data && !error ? <div className="skeleton mt-8 h-64" /> : null}

        {data ? (
          <>
            <div className="mt-8 flex flex-wrap items-center gap-2 text-sm text-ink-muted">
              <span className="label-quiet text-ink">{t("cases", { n: data.n, pos: data.positives, neg: data.negatives })}</span>
              <span>{t("ranAt", { time: format.dateTime(new Date(data.ran_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" }) })}</span>
              <span className="font-mono text-xs">
                <bdi dir="ltr">{t("rules", { v: data.rules_version })}</bdi>
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <Ring value={data.recall} label={t("recall")} sub={t("target")} color={PALETTE.jisr} />
              <Ring value={data.precision} label={t("precision")} sub={`${t("fp")}: ${data.false_positives.length}`} color={PALETTE.mid} />
              <div className="card flex flex-col items-center justify-center p-6 text-center">
                <p className="headline tabular text-5xl">
                  {data.latency_p95_ms.toFixed(data.latency_p95_ms < 1 ? 2 : data.latency_p95_ms < 10 ? 1 : 0)}
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
                      <Bar dataKey="recall" name={t("recall")} fill={PALETTE.jisr} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
                      <Bar dataKey="precision" name={t("precision")} fill={PALETTE.mid} radius={[4, 4, 0, 0]} maxBarSize={36} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="mt-2 text-sm text-ink-muted">{(data.by_language ?? []).map((b) => `${lang(b.lang)} n=${b.n}`).join(" · ")}</p>
                {data.by_category && data.by_category.length > 0 ? (
                  <>
                    <h3 className="mt-5 text-sm font-semibold">{t("byCategory")}</h3>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {data.by_category.map((c) => (
                        <li key={c.category} className="rounded-md bg-surface-muted px-2.5 py-1 text-sm">
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
                      <li key={c.id} className="rounded-lg border border-red/30 bg-red-bg p-3 text-sm">
                        <span className="font-mono text-xs">{c.id} · {lang(c.lang)}</span>
                        <p dir="auto">{c.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <h2 className="mt-6 text-lg font-semibold tracking-tight">{t("fp")}</h2>
                <p className="text-sm text-ink-muted">{t("fpNote")}</p>
                {data.false_positives.length === 0 ? (
                  <p className="mt-2 text-sm text-ink-muted">{t("fnNone")}</p>
                ) : (
                  <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                    {data.false_positives.map((c) => (
                      <li key={c.id} className="rounded-lg bg-surface-muted p-3 text-sm">
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
            <p className="mt-4 text-sm text-ink-muted">{t("onlyApi")}</p>
          </>
        ) : null}
      </div>
    </main>
  );
}
