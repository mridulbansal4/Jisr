"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, problemMessage, type CopilotAnswer, type CopilotChart } from "@/lib/api";
import { Badge, Icon, btn } from "../ui";
import { PALETTE, SimLabel, tooltipStyle } from "../charts/common";
import { motion, useReducedMotion } from "../motion";

const SERIES_COLORS = [PALETTE.jisr, PALETTE.coral, PALETTE.teal, PALETTE.amber];

/** Reveals text progressively; instant with reduced motion. */
function useTypewriter(text: string, cps = 90): string {
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (reduce) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restart the reveal for new text
    setN(0);
    const step = Math.max(1, Math.round(cps / 30));
    const id = setInterval(() => {
      setN((x) => {
        if (x >= text.length) {
          clearInterval(id);
          return x;
        }
        return x + step;
      });
    }, 33);
    return () => clearInterval(id);
  }, [text, cps, reduce]);
  return reduce ? text : text.slice(0, n);
}

interface SuppressedShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: Record<string, unknown>;
  dataKey?: string;
  fill?: string;
}

export function CopilotChartView({ chart }: { chart: CopilotChart }) {
  const t = useTranslations("copilot");
  const reduce = useReducedMotion();
  const all = chart.series.flatMap((s) => s.values).filter((v): v is number => v !== null);
  const max = all.length ? Math.max(...all) : 1;
  const placeholder = max * 0.18;
  const rows = chart.x.map((x, i) => {
    const row: Record<string, string | number | boolean | null> = { x };
    chart.series.forEach((s, si) => {
      const v = s.values[i] ?? null;
      row[`s${si}`] = v === null ? placeholder : v;
      row[`s${si}_supp`] = v === null;
    });
    return row;
  });
  const unit = chart.unit ?? "";

  function SuppressedAwareBar(props: SuppressedShapeProps) {
    const { x = 0, y = 0, width = 0, height = 0, payload, dataKey, fill } = props;
    if (payload && dataKey && payload[`${dataKey}_supp`]) {
      return (
        <g>
          <defs>
            <pattern id="supp-hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="7" height="7" fill="var(--hatch-a)" />
              <line x1="0" y1="0" x2="0" y2="7" stroke="var(--hatch-b)" strokeWidth="2" />
            </pattern>
          </defs>
          <rect x={x} y={y} width={width} height={height} rx={8} fill="url(#supp-hatch)" stroke="var(--border-strong)" strokeDasharray="4 3" />
          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={11} fill="var(--text-muted)">
            {"<10"}
          </text>
        </g>
      );
    }
    return <rect x={x} y={y} width={width} height={height} rx={8} fill={fill} />;
  }

  const fmt = (v: unknown, name: unknown, item: { payload?: Record<string, unknown>; dataKey?: unknown }) => {
    const key = String(item.dataKey ?? "");
    if (item.payload && item.payload[`${key}_supp`]) return [t("suppressed"), String(name)];
    return [`${typeof v === "number" ? v.toFixed(1) : String(v)}${unit}`, String(name)];
  };

  return (
    <figure className="mt-4">
      <figcaption className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
        {chart.title}
        <SimLabel />
      </figcaption>
      <div dir="ltr" className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chart.type === "line" ? (
            <LineChart data={rows} margin={{ top: 16, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="x" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} unit={unit} />
              <Tooltip {...tooltipStyle} formatter={fmt as never} />
              {chart.series.map((s, si) => (
                <Line key={s.name} type="monotone" dataKey={`s${si}`} name={s.name} stroke={SERIES_COLORS[si % 4]} strokeWidth={3} dot={{ r: 3 }} isAnimationActive={!reduce} animationDuration={1200} />
              ))}
            </LineChart>
          ) : (
            <BarChart data={rows} margin={{ top: 20, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="x" tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} unit={unit} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "var(--surface-muted)" }} formatter={fmt as never} />
              {chart.series.map((s, si) => (
                <Bar key={s.name} dataKey={`s${si}`} name={s.name} fill={SERIES_COLORS[si % 4]} shape={SuppressedAwareBar as never} isAnimationActive={!reduce} animationDuration={900} maxBarSize={56} />
              ))}
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </figure>
  );
}

export function Copilot() {
  const t = useTranslations("copilot");
  const tb = useTranslations("badges");
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [asked, setAsked] = useState<string | null>(null);
  const [res, setRes] = useState<CopilotAnswer | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const typed = useTypewriter(res?.answer ?? "");
  const done = !res || typed.length >= res.answer.length;

  async function ask(question: string) {
    const qq = question.trim();
    if (!qq || busy) return;
    setBusy(true);
    setError(null);
    setAsked(qq);
    setQ("");
    try {
      setRes(await api.programmeAsk(qq));
    } catch (e) {
      setRes(null);
      setError(`${t("failed")} (${problemMessage(e)})`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
      <div aria-hidden className="orb orb-coral -start-24 -top-32 size-72 opacity-50" />
      <div aria-hidden className="orb orb-indigo -end-24 -top-24 size-72 opacity-50" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff7a45] to-[#4f46e5] text-white">
            <Icon name="sparkles" className="size-5" />
          </span>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
            <p className="text-sm text-ink-muted">{t("sub")}</p>
          </div>
          <SimLabel />
        </div>
        <form
          className="mt-5 flex items-center gap-2 rounded-full border border-line-strong/50 bg-bg-elevated p-1.5 ps-5 transition-shadow focus-within:shadow-[var(--shadow-lift)]"
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            void ask(q);
          }}
        >
          <label htmlFor="copilot-q" className="sr-only">
            {t("inputLabel")}
          </label>
          <input id="copilot-q" dir="auto" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("placeholder")} className="min-h-11 flex-1 bg-transparent text-base outline-none placeholder:text-ink-faint" maxLength={300} />
          <button type="submit" className={btn.primary} disabled={busy || !q.trim()}>
            {busy ? t("asking") : t("ask")}
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </button>
        </form>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["q1", "q2", "q3", "q4"] as const).map((k) => (
            <button key={k} type="button" dir="auto" className={btn.chip} onClick={() => void ask(t(k))} disabled={busy}>
              {t(k)}
            </button>
          ))}
        </div>

        {error ? <p className="mt-4 rounded-2xl border border-red/30 bg-red-bg px-4 py-3 text-sm text-red">{error}</p> : null}
        {busy ? (
          <div className="mt-5 space-y-2">
            <div className="skeleton h-4 w-10/12" />
            <div className="skeleton h-4 w-8/12" />
            <div className="skeleton h-48" />
          </div>
        ) : null}
        {res && !busy ? (
          <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div>
              {asked ? <p className="mb-2 text-sm font-semibold text-ink-muted">“{asked}”</p> : null}
              <div className="rounded-[22px] border border-dashed border-ai/40 bg-ai-bg/40 p-4" data-content-type="ai">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {res.content_type === "ai_drafted" ? (
                    <Badge tone="ai">
                      <Icon name="sparkles" className="size-3" />
                      {tb("ai")}
                    </Badge>
                  ) : (
                    <Badge>{tb("standard")}</Badge>
                  )}
                  <span className="font-mono text-[11px] text-ink-faint">
                    {res.provider} · {t("intent", { intent: res.intent })}
                  </span>
                </div>
                <p className="min-h-16 whitespace-pre-wrap leading-relaxed" aria-live="polite">
                  {typed}
                  {!done ? <span aria-hidden className="ms-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-ai" /> : null}
                </p>
              </div>
              {res.suppressed_note ? (
                <p className="mt-2 flex items-center gap-2 text-xs text-ink-muted">
                  <span className="hatch rounded px-1.5 py-0.5 font-semibold">{t("suppressed")}</span>
                  {res.suppressed_note}
                </p>
              ) : null}
            </div>
            {res.chart ? <CopilotChartView chart={res.chart} /> : null}
          </motion.div>
        ) : null}
      </div>
    </section>
  );
}
