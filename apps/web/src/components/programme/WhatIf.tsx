"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, problemMessage, type SimResult } from "@/lib/api";
import { useReducedMotion } from "../motion";
import { PALETTE, Panel, tooltipStyle } from "../charts/common";


interface Scenario {
  capacity_multiplier: number;
  sla_hours: number;
  baseline_conversion: number;
}

function Slider({ id, label, value, min, max, step, display, onChange }: { id: string; label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <output htmlFor={id} className="text-sm font-semibold tabular text-ink">
          <bdi dir="ltr">{display}</bdi>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full cursor-pointer accent-[var(--primary)]"
        style={{ backgroundImage: `linear-gradient(to right, var(--primary) ${pct}%, transparent ${pct}%)`, backgroundSize: "100% 4px", backgroundRepeat: "no-repeat", backgroundPosition: "center" }}
      />
    </div>
  );
}

export function WhatIf() {
  const t = useTranslations("dash");
  const tp = useTranslations("programme");
  const reduce = useReducedMotion();
  const [sc, setSc] = useState<Scenario>({ capacity_multiplier: 1, sla_hours: 48, baseline_conversion: 0.35 });
  const [res, setRes] = useState<SimResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  useEffect(() => {
    const my = ++seq.current;
    const id = setTimeout(() => {
      setBusy(true);
      api
        .runSimulation({ cohort_size: 5000, seed: 42, scenario: sc })
        .then((r) => {
          if (my !== seq.current) return;
          setRes(r);
          setError(null);
        })
        .catch((e) => my === seq.current && setError(problemMessage(e)))
        .finally(() => my === seq.current && setBusy(false));
    }, 350);
    return () => clearTimeout(id);
  }, [sc]);

  const curve = res?.curve ? res.curve.days.map((d, i) => ({ d, baseline: res.curve!.baseline_cum_pct[i], jisr: res.curve!.jisr_cum_pct[i] })) : [];

  return (
    <Panel title={t("whatIf")} sub={t("whatIfSub")} extra={busy ? <span className="text-sm text-ink-muted">{tp("sim.running")}</span> : null}>
      <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="space-y-5">
          <Slider id="sim-cap" label={t("capacity")} value={sc.capacity_multiplier} min={0.5} max={2} step={0.1} display={`× ${sc.capacity_multiplier.toFixed(1)}`} onChange={(v) => setSc((s) => ({ ...s, capacity_multiplier: v }))} />
          <Slider id="sim-sla" label={t("slaHours")} value={sc.sla_hours} min={12} max={96} step={12} display={t("hours", { n: sc.sla_hours })} onChange={(v) => setSc((s) => ({ ...s, sla_hours: v }))} />
          <Slider id="sim-base" label={t("baselineConv")} value={sc.baseline_conversion} min={0.1} max={0.6} step={0.05} display={`${Math.round(sc.baseline_conversion * 100)}%`} onChange={(v) => setSc((s) => ({ ...s, baseline_conversion: v }))} />
          {res ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-surface-muted p-3">
                <p className="text-sm text-ink-muted">{tp("sim.conversion")}</p>
                <p className="mt-1 text-sm tabular">
                  <bdi dir="ltr">
                    <span className="text-ink-faint">{res.baseline.conversion_pct.toFixed(1)}</span>
                    {" → "}
                    <span className="text-xl font-semibold text-ink">{res.jisr.conversion_pct.toFixed(1)}</span>
                  </bdi>
                </p>
              </div>
              <div className="rounded-lg bg-surface-muted p-3">
                <p className="text-sm text-ink-muted">{tp("sim.days")}</p>
                <p className="mt-1 text-sm tabular">
                  <bdi dir="ltr">
                    <span className="text-ink-faint">{res.baseline.median_days_to_care.toFixed(1)}</span>
                    {" → "}
                    <span className="text-xl font-semibold text-ink">{res.jisr.median_days_to_care.toFixed(1)}</span>
                  </bdi>
                </p>
              </div>
              {res.waiting_list ? (
                <div className="col-span-2 rounded-lg border border-line p-3">
                  <p className="text-sm text-ink-muted">{t("waiting")}</p>
                  <div className="mt-1 flex items-end gap-4 tabular">
                    <span>
                      <span className="block text-xs text-ink-muted">{tp("sim.baseline")}</span>
                      <span className="text-2xl font-semibold text-ink-muted">{Math.round(res.waiting_list.baseline)}</span>
                    </span>
                    <span className="pb-1 text-ink-faint">→</span>
                    <span>
                      <span className="block text-xs text-ink-muted">{tp("sim.jisr")}</span>
                      <span className="text-2xl font-semibold text-ink">{Math.round(res.waiting_list.jisr)}</span>
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <div>
          {error ? <p className="text-sm text-red">{`${tp("loadFailed")} (${error})`}</p> : null}
          <p className="mb-2 text-sm font-medium">{t("cumCare")}</p>
          <div dir="ltr" className={`h-72 transition-opacity ${busy ? "opacity-70" : ""}`}>
            {curve.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="wi-jisr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE.jisr} stopOpacity={0.16} />
                      <stop offset="100%" stopColor={PALETTE.jisr} stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="wi-base" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PALETTE.baseline} stopOpacity={0.12} />
                      <stop offset="100%" stopColor={PALETTE.baseline} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="d" tickLine={false} axisLine={false} tickFormatter={(d: number) => t("dayN", { d })} />
                  <YAxis tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip {...tooltipStyle} labelFormatter={(d) => t("dayN", { d: Number(d) })} formatter={(v) => `${Number(v).toFixed(1)}%`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="baseline" name={tp("sim.baseline")} stroke={PALETTE.baseline} strokeDasharray="5 4" strokeWidth={2} fill="url(#wi-base)" isAnimationActive={!reduce} animationDuration={700} />
                  <Area type="monotone" dataKey="jisr" name={tp("sim.jisr")} stroke={PALETTE.jisr} strokeWidth={2.5} fill="url(#wi-jisr)" isAnimationActive={!reduce} animationDuration={700} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="skeleton h-full" />
            )}
          </div>
          {res?.assumptions?.length ? (
            <details className="mt-3 text-sm">
              <summary className="min-h-11 cursor-pointer py-2 font-medium">{tp("sim.assumptions")}</summary>
              <ul className="list-disc ps-5 text-ink-muted">
                {res.assumptions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}
