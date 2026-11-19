"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Bar, CartesianGrid, ComposedChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, ReferenceLine } from "recharts";
import {
  api,
  problemMessage,
  type FairnessBy,
  type FairnessMetric,
  type FairnessTable,
  type Geo,
  type GeoRegion,
  type ProgrammeMetrics,
  type SlaItem,
  type Timeseries,
} from "@/lib/api";
import { formatMetric } from "@/lib/fairness";
import { CountUp, Reveal, motion, useReducedMotion } from "../motion";
import { PALETTE, Panel, SimLabel, Sparkline, tooltipStyle } from "../charts/common";
import { Alert, Icon, input } from "../ui";
import { Copilot } from "./Copilot";
import { WhatIf } from "./WhatIf";

const METRICS: FairnessMetric[] = ["conversion", "time_to_care", "reliable_improvement"];
const BYS: FairnessBy[] = ["sex", "age_band", "nationality_group", "language", "insurance_plan"];

function humanize(key: string): string {
  const s = key.replaceAll("_", " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
const last = (xs: (number | null)[]) => [...xs].reverse().find((v): v is number => v !== null) ?? null;

/* ------------------------------------------------------------------ */
/* KPI cards with sparklines                                           */
/* ------------------------------------------------------------------ */
function Kpis({ m, ts }: { m: ProgrammeMetrics | null; ts: Timeseries | null }) {
  const t = useTranslations("dash");
  const screens = ts ? ts.series.screens.reduce((a, b) => a + b, 0) : (m?.funnel.screened ?? null);
  const conv = m?.kpis.conversion_pct ?? (ts ? last(ts.series.conversion_pct) : null);
  const days = m?.kpis.median_days_to_care ?? (ts ? last(ts.series.median_days_to_care) : null);
  const ack = m?.kpis.red_ack_median_min ?? (ts ? last(ts.series.red_ack_p50_min) : null);
  const cards = [
    { key: "screens", label: t("kpiScreens"), value: screens, fmt: (n: number) => Math.round(n).toLocaleString("en"), spark: ts?.series.screens, color: PALETTE.jisr, base: null },
    { key: "conv", label: t("kpiConversion"), value: conv, fmt: (n: number) => `${n.toFixed(1)}%`, spark: ts?.series.conversion_pct, color: PALETTE.teal, base: m?.baseline?.conversion_pct != null ? `${m.baseline.conversion_pct}%` : null },
    { key: "days", label: t("kpiDays"), value: days, fmt: (n: number) => t("days", { n: n.toFixed(1) }), spark: ts?.series.median_days_to_care, color: PALETTE.coral, base: m?.baseline?.median_days_to_care != null ? t("days", { n: m.baseline.median_days_to_care }) : null },
    { key: "ack", label: t("kpiRedAck"), value: ack, fmt: (n: number) => t("minutes", { n: n.toFixed(1) }), spark: ts?.series.red_ack_p50_min, color: PALETTE.amber, base: null },
  ];
  const tp = useTranslations("programme");
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c, i) => (
        <Reveal key={c.key} delay={i * 0.06} className="card lift flex flex-col p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-ink-muted">{c.label}</p>
            <SimLabel />
          </div>
          <p className="headline mt-2 text-3xl sm:text-4xl">{c.value === null || c.value === undefined ? "n/a" : <CountUp value={c.value} format={c.fmt} />}</p>
          {c.base ? <p className="text-xs text-ink-faint">{`${tp("sim.baseline")}: ${c.base}`}</p> : <p className="text-xs">&nbsp;</p>}
          {c.spark ? (
            <div className="mt-3">
              <Sparkline values={c.spark} color={c.color} id={c.key} />
            </div>
          ) : null}
        </Reveal>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
function TrendPanel({ ts }: { ts: Timeseries }) {
  const t = useTranslations("dash");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const rows = ts.weeks.map((w, i) => ({
    w: format.dateTime(new Date(w), { day: "numeric", month: "short" }),
    screens: ts.series.screens[i],
    positive: ts.series.positive[i],
    referred: ts.series.referred[i],
    attended: ts.series.attended[i],
  }));
  const lines = [
    { k: "screens", c: PALETTE.baseline },
    { k: "positive", c: PALETTE.coral },
    { k: "referred", c: PALETTE.jisr },
    { k: "attended", c: PALETTE.teal },
  ] as const;
  return (
    <Panel title={t("trend")} sub={t("trendSub")} className="lg:col-span-2">
      <div dir="ltr" className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="w" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {lines.map((l, i) => (
              <Line key={l.k} type="monotone" dataKey={l.k} name={t(`series.${l.k}`)} stroke={l.c} strokeWidth={l.k === "screens" ? 2 : 3} strokeDasharray={l.k === "screens" ? "4 4" : undefined} dot={false} activeDot={{ r: 5 }} isAnimationActive={!reduce} animationDuration={1300} animationBegin={i * 150} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
function FunnelPanel({ m }: { m: ProgrammeMetrics }) {
  const t = useTranslations("dash");
  const tp = useTranslations("programme");
  const reduce = useReducedMotion();
  const entries = Object.entries(m.funnel);
  const first = entries[0]?.[1] || 1;
  return (
    <Panel title={t("funnel")} sub={tp("funnel")}>
      <ol className="space-y-3">
        {entries.map(([stage, n], i) => {
          const pct = (n / first) * 100;
          const label = t.has(`series.${stage}` as never) ? t(`series.${stage}` as never) : humanize(stage);
          return (
            <li key={stage}>
              <div className="mb-1 flex justify-between gap-2 text-sm">
                <span className="font-medium">{label}</span>
                <span className="tabular">
                  <strong>{n.toLocaleString("en")}</strong>
                  <span className="ms-1.5 text-ink-muted">{Math.round(pct)}%</span>
                </span>
              </div>
              <div className="h-7 w-full overflow-hidden rounded-xl bg-surface-muted" aria-hidden>
                <motion.div
                  className="h-full rounded-xl bg-gradient-to-r from-coral via-[#d9467a] to-indigo rtl:bg-gradient-to-l"
                  style={{ opacity: 1 - i * 0.1 }}
                  initial={reduce ? false : { width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                />
              </div>
            </li>
          );
        })}
      </ol>
      {m.drop_off_reasons && m.drop_off_reasons.length > 0 ? (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold">{tp("dropOff")}</h3>
          <ul className="flex flex-wrap gap-1.5 text-xs">
            {m.drop_off_reasons.map((d, i) => (
              <li key={`${d.reason}-${i}`} className="rounded-full border border-line bg-surface-muted px-2.5 py-1">
                {humanize(d.reason ?? "n/a")}{" "}
                {d.n === null || d.n === undefined ? <span className="hatch rounded px-1">{"<10"}</span> : <strong className="tabular">{d.n}</strong>}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
function TimeToCarePanel({ ts, baselineDays }: { ts: Timeseries; baselineDays?: number }) {
  const t = useTranslations("dash");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const rows = ts.weeks.map((w, i) => ({
    w: format.dateTime(new Date(w), { day: "numeric", month: "short" }),
    days: ts.series.median_days_to_care[i],
    conv: ts.series.conversion_pct[i],
  }));
  return (
    <Panel title={t("timeToCare")} sub={t("timeToCareSub")}>
      <div dir="ltr" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis dataKey="w" tickLine={false} axisLine={false} />
            <YAxis yAxisId="d" tickLine={false} axisLine={false} />
            <YAxis yAxisId="c" orientation="right" tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
            <Tooltip {...tooltipStyle} />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            {baselineDays ? <ReferenceLine yAxisId="d" y={baselineDays} stroke={PALETTE.baseline} strokeDasharray="5 4" label={{ value: `baseline ${baselineDays} d`, position: "insideTopLeft", fontSize: 11, fill: "var(--text-muted)" }} /> : null}
            <Bar yAxisId="c" dataKey="conv" name={t("series.conversion")} fill={PALETTE.teal} fillOpacity={0.22} radius={[6, 6, 0, 0]} isAnimationActive={!reduce} />
            <Line yAxisId="d" type="monotone" dataKey="days" name={t("series.median_days")} stroke={PALETTE.coral} strokeWidth={3} dot={{ r: 3 }} connectNulls isAnimationActive={!reduce} animationDuration={1300} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
function Gauge({ item }: { item: SlaItem }) {
  const t = useTranslations("dash");
  const reduce = useReducedMotion();
  const pct = item.met_pct ?? 0;
  const R = 46;
  const C = Math.PI * R;
  const color = pct >= 95 ? "var(--status-green-fg)" : pct >= 75 ? "var(--status-amber-fg)" : "var(--status-red-fg)";
  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-bg-elevated p-3 text-center">
      <svg viewBox="0 0 110 62" className="w-full max-w-36" aria-hidden>
        <path d="M9 56 A46 46 0 0 1 101 56" fill="none" stroke="var(--surface-muted)" strokeWidth={10} strokeLinecap="round" />
        <motion.path
          d="M9 56 A46 46 0 0 1 101 56"
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={reduce ? false : { strokeDashoffset: C }}
          whileInView={{ strokeDashoffset: C * (1 - pct / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
          style={reduce ? { strokeDashoffset: C * (1 - pct / 100) } : undefined}
        />
      </svg>
      <p className="-mt-6 text-2xl font-bold tabular" style={{ color }}>
        {item.met_pct === null ? "n/a" : <CountUp value={pct} decimals={pct % 1 ? 1 : 0} format={(n) => `${n.toFixed(pct % 1 ? 1 : 0)}%`} />}
      </p>
      <p className="mt-1 text-sm font-semibold">{t(`slaKinds.${item.kind}`)}</p>
      <p className="text-xs text-ink-muted">{t("target", { t: item.target })}</p>
      <p className="text-xs text-ink-muted">
        <bdi dir="ltr">{t("p50p90", { p50: item.p50, p90: item.p90 })}</bdi>
      </p>
      <p className={`mt-1 text-xs font-semibold ${item.breaches > 0 ? "text-red" : "text-green"}`}>{t("breaches", { n: item.breaches })}</p>
    </div>
  );
}

function SlaPanel({ items }: { items: SlaItem[] }) {
  const t = useTranslations("dash");
  return (
    <Panel title={t("sla")}>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <Gauge key={it.kind} item={it} />
        ))}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Fairness heatmap: groups × metrics for one grouping                 */
/* ------------------------------------------------------------------ */
function HeatmapPanel() {
  const t = useTranslations("programme");
  const td = useTranslations("dash");
  const [by, setBy] = useState<FairnessBy>("nationality_group");
  const [focus, setFocus] = useState<FairnessMetric>("conversion");
  const [tables, setTables] = useState<Partial<Record<FairnessMetric, FairnessTable>>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all(METRICS.map((m) => api.getFairness(m, by).then((tb) => [m, tb] as const)))
      .then((pairs) => {
        if (cancelled) return;
        setTables(Object.fromEntries(pairs));
        setError(null);
      })
      .catch((e) => !cancelled && setError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [by]);

  const groups: { id: string; label: string }[] = [];
  for (const m of METRICS)
    for (const r of tables[m]?.rows ?? []) if (!groups.some((g) => g.id === r.group)) groups.push({ id: r.group, label: (r as { group_label?: string }).group_label ?? humanize(r.group) });

  const range = (m: FairnessMetric) => {
    const vs = (tables[m]?.rows ?? []).filter((r) => !r.suppressed && r.value != null).map((r) => r.value as number);
    return vs.length ? [Math.min(...vs), Math.max(...vs)] : [0, 1];
  };
  const intensity = (m: FairnessMetric, v: number) => {
    const [lo, hi] = range(m);
    const x = hi === lo ? 0.5 : (v - lo) / (hi - lo);
    return m === "time_to_care" ? 1 - x : x; // lower time is better
  };
  const focusTable = tables[focus];

  return (
    <Panel title={td("heatmap")} sub={t("fairness")} className="lg:col-span-3">
      <div className="mb-4 flex flex-wrap gap-3">
        <div>
          <label htmlFor="f-by" className="mb-1 block text-xs font-semibold">
            {t("by")}
          </label>
          <select id="f-by" className={`${input} min-w-44`} value={by} onChange={(e) => setBy(e.target.value as FairnessBy)}>
            {BYS.map((x) => (
              <option key={x} value={x}>
                {t(`byOptions.${x}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-metric" className="mb-1 block text-xs font-semibold">
            {t("metric")}
          </label>
          <select id="f-metric" className={`${input} min-w-44`} value={focus} onChange={(e) => setFocus(e.target.value as FairnessMetric)}>
            {METRICS.map((x) => (
              <option key={x} value={x}>
                {t(`metrics.${x}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <Alert tone="error">{`${t("loadFailed")} (${error})`}</Alert> : null}
      {groups.length === 0 && !error ? <div className="skeleton h-48" /> : null}
      {groups.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-separate border-spacing-1.5 text-sm">
            <caption className="sr-only">{`${td("heatmap")} · ${t(`byOptions.${by}`)}`}</caption>
            <thead>
              <tr>
                <th scope="col" className="text-start text-xs font-semibold text-ink-muted">
                  {t("group")}
                </th>
                {METRICS.map((m) => (
                  <th key={m} scope="col" className={`px-2 text-center text-xs font-semibold ${m === focus ? "text-primary" : "text-ink-muted"}`}>
                    {t(`metrics.${m}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id}>
                  <th scope="row" className="whitespace-nowrap pe-2 text-start font-medium">
                    {g.label}
                  </th>
                  {METRICS.map((m) => {
                    const row = tables[m]?.rows.find((r) => r.group === g.id);
                    if (!row) return <td key={m} className="rounded-xl bg-surface-muted p-3 text-center text-ink-faint">n/a</td>;
                    if (row.suppressed || row.suppression)
                      return (
                        <td key={m} className="hatch rounded-xl p-3 text-center text-xs font-semibold" title={t("suppressed")}>
                          {"<10"}
                        </td>
                      );
                    const v = row.value as number;
                    const a = intensity(m, v);
                    return (
                      <td
                        key={m}
                        className={`rounded-xl p-3 text-center font-semibold tabular transition-transform hover:scale-105 ${m === focus ? "ring-2 ring-primary/40" : ""}`}
                        style={{ background: `color-mix(in oklab, var(--chart-jisr) ${Math.round(12 + a * 70)}%, var(--surface))`, color: a > 0.55 ? "white" : "var(--text)" }}
                        title={row.ci95 ? `95% CI ${row.ci95[0]} to ${row.ci95[1]} · n ${row.n}` : `n ${row.n}`}
                      >
                        {formatMetric(v, m)}
                        <span className="block text-[10px] font-normal opacity-80">n {row.n}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <div className="mt-3 space-y-1 text-xs text-ink-muted">
        {focusTable ? <p>{t("suppressionNote", { k: focusTable.k })}</p> : null}
        {focusTable?.max_gap_pp != null ? <p className="text-sm font-semibold text-ink">{t("maxGap", { gap: focusTable.max_gap_pp.toFixed(1) })}</p> : null}
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
/* Stylised Abu Dhabi regions (not to scale)                           */
/* ------------------------------------------------------------------ */
const REGION_SHAPES: Record<GeoRegion["id"], { d: string; lx: number; ly: number }> = {
  al_dhafra: { d: "M12 70 L150 52 L196 70 L214 118 L196 176 L120 204 L30 190 L8 140 Z", lx: 106, ly: 132 },
  abu_dhabi_city: { d: "M150 52 L232 22 L292 40 L300 92 L260 118 L214 118 L196 70 Z", lx: 246, ly: 74 },
  al_ain: { d: "M214 118 L260 118 L300 92 L352 104 L372 160 L330 206 L250 212 L196 176 Z", lx: 290, ly: 160 },
};

function GeoPanel({ geo }: { geo: Geo }) {
  const t = useTranslations("dash");
  const reduce = useReducedMotion();
  const [hover, setHover] = useState<string | null>(null);
  const vals = geo.regions.filter((r) => !r.suppressed && r.conversion_pct != null).map((r) => r.conversion_pct as number);
  const lo = Math.min(...vals, 100);
  const hi = Math.max(...vals, 0);
  return (
    <Panel title={t("geo")} sub={t("geoSub")} className="lg:col-span-2">
      <div className="grid gap-4">
        <svg viewBox="0 0 380 220" className="w-full" role="img" aria-label={t("geoSub")}>
          <defs>
            <pattern id="geo-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="var(--hatch-a)" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="var(--hatch-b)" strokeWidth="2" />
            </pattern>
          </defs>
          <path d="M0 40 Q 120 20 240 10 T 380 30" fill="none" stroke="var(--chart-grid)" strokeWidth={14} strokeLinecap="round" opacity={0.8} />
          {geo.regions.map((r, i) => {
            const s = REGION_SHAPES[r.id];
            if (!s) return null;
            const a = r.suppressed || r.conversion_pct == null ? null : hi === lo ? 0.6 : (r.conversion_pct - lo) / (hi - lo);
            const fill = a === null ? "url(#geo-hatch)" : `color-mix(in oklab, var(--chart-jisr) ${Math.round(25 + a * 60)}%, var(--surface))`;
            const on = hover === r.id;
            return (
              <g key={r.id} onMouseEnter={() => setHover(r.id)} onMouseLeave={() => setHover(null)} className="cursor-default">
                <motion.path
                  d={s.d}
                  fill={fill}
                  stroke="var(--surface)"
                  strokeWidth={on ? 4 : 2.5}
                  initial={reduce ? false : { opacity: 0, scale: 0.96 }}
                  whileInView={{ opacity: 1, scale: on ? 1.02 : 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  style={{ transformOrigin: `${s.lx}px ${s.ly}px`, filter: on ? "drop-shadow(0 6px 12px rgba(59,53,181,0.35))" : undefined }}
                />
                <text x={s.lx} y={s.ly - 4} textAnchor="middle" fontSize={12} fontWeight={600} fill={a !== null && a > 0.55 ? "white" : "var(--text)"}>
                  {r.name}
                </text>
                <text x={s.lx} y={s.ly + 12} textAnchor="middle" fontSize={16} fontWeight={800} fill={a !== null && a > 0.55 ? "white" : "var(--text)"}>
                  {r.suppressed || r.conversion_pct == null ? "<10" : `${r.conversion_pct.toFixed(0)}%`}
                </text>
              </g>
            );
          })}
        </svg>
        <ul className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          {geo.regions.map((r) => (
            <li
              key={r.id}
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
              className={`rounded-2xl border p-3 transition-all ${hover === r.id ? "border-primary bg-primary-soft" : "border-line"}`}
            >
              <p className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="flex items-center gap-1.5">
                  <Icon name="map" className="size-3.5 text-ink-faint" />
                  {r.name}
                </span>
                <span className="tabular">{r.suppressed || r.conversion_pct == null ? <span className="hatch rounded px-1.5 text-xs">{"<10"}</span> : `${r.conversion_pct.toFixed(1)}%`}</span>
              </p>
              <p className="text-xs text-ink-muted">
                {t("geoScreens", { n: r.screens })}
                {r.median_days_to_care != null ? ` · ${t("days", { n: r.median_days_to_care })}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------------------ */
export function ProgrammeDashboard() {
  const t = useTranslations("programme");
  const td = useTranslations("dash");
  const [m, setM] = useState<ProgrammeMetrics | null>(null);
  const [ts, setTs] = useState<Timeseries | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [sla, setSla] = useState<SlaItem[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fail = (e: unknown) => !cancelled && setErrors((xs) => [...xs, problemMessage(e)]);
    api.getMetrics().then((x) => !cancelled && setM(x), fail);
    api.getTimeseries().then((x) => !cancelled && setTs(x), fail);
    api.getGeo().then((x) => !cancelled && setGeo(x), fail);
    api.getSla().then((x) => !cancelled && setSla(x.items), fail);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1">
          <h1 className="headline text-3xl sm:text-5xl">{t("title")}</h1>
          <p className="mt-2 text-ink-muted">{td("aggregateNote")}</p>
        </div>
        <SimLabel />
      </div>
      {errors.length > 0 ? <Alert tone="warn">{`${t("loadFailed")} (${errors[0]})`}</Alert> : null}

      <Kpis m={m} ts={ts} />
      <Copilot />

      <div className="grid gap-5 lg:grid-cols-3">
        {ts ? <TrendPanel ts={ts} /> : <div className="skeleton h-80 lg:col-span-2" />}
        {m ? <FunnelPanel m={m} /> : <div className="skeleton h-80" />}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {ts ? <TimeToCarePanel ts={ts} baselineDays={m?.baseline?.median_days_to_care} /> : <div className="skeleton h-72" />}
        {sla ? <SlaPanel items={sla} /> : <div className="skeleton h-72" />}
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        <HeatmapPanel />
        {geo ? <GeoPanel geo={geo} /> : <div className="skeleton h-72 lg:col-span-2" />}
      </div>

      <WhatIf />
    </div>
  );
}
