"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api, problemMessage, type Trajectory } from "@/lib/api";
import { reliableIndexes } from "@/lib/trajectory";
import { useReducedMotion } from "../motion";
import { Badge, Spinner } from "../ui";

const PHQ_COLOR = "var(--chart-jisr)";
const GAD_COLOR = "var(--chart-2)";

interface DotProps {
  cx?: number;
  cy?: number;
  index?: number;
}

function makeDot(color: string, reliable: Set<number>) {
  function TrajectoryDot({ cx, cy, index }: DotProps) {
    if (cx === undefined || cy === undefined) return null;
    const rc = index !== undefined && reliable.has(index);
    return (
      <g>
        {rc ? <circle cx={cx} cy={cy} r={10} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="2 2" /> : null}
        <circle cx={cx} cy={cy} r={rc ? 5.5 : 4} fill="var(--surface)" stroke={color} strokeWidth={2.5} />
      </g>
    );
  }
  return TrajectoryDot;
}

export function TrajectoryChart({ episodeId, compact = false }: { episodeId: string; compact?: boolean }) {
  const t = useTranslations("trajectory");
  const tc = useTranslations("common");
  const format = useFormatter();
  const reduce = useReducedMotion();
  const [data, setData] = useState<Trajectory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .getTrajectory(episodeId)
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  if (error) return <p className="text-sm text-ink-muted">{`${t("failed")} (${error})`}</p>;
  if (!data) return <Spinner label={tc("loading")} />;
  if (data.points.length < 2) return <p className="text-sm text-ink-muted">{t("empty")}</p>;

  const rows = data.points.map((p, i) => ({
    i,
    label: p.label || format.dateTime(new Date(p.at), { day: "numeric", month: "short" }),
    phq9: p.phq9 ?? null,
    gad7: p.gad7 ?? null,
  }));
  const phqRc = reliableIndexes(rows.map((r) => r.phq9), data.rci_thresholds.PHQ9);
  const gadRc = reliableIndexes(rows.map((r) => r.gad7), data.rci_thresholds.GAD7);
  const cls = (k: "PHQ9" | "GAD7") => {
    const c = data.classification?.[k];
    if (!c) return null;
    const tone = c === "reliable_improvement" ? "ok" : c === "reliable_deterioration" ? "red" : "neutral";
    return (
      <Badge tone={tone}>
        {k === "PHQ9" ? "PHQ-9" : "GAD-7"} · {t.has(`classes.${c}` as never) ? t(`classes.${c}` as never) : c}
      </Badge>
    );
  };

  return (
    <figure className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {cls("PHQ9")}
        {cls("GAD7")}
      </div>
      <div dir="ltr" className={compact ? "h-56" : "h-72"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 12, right: 16, bottom: 4, left: -16 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            {data.caseness.PHQ9 !== undefined ? <ReferenceArea y1={data.caseness.PHQ9} y2={27} fill={PHQ_COLOR} fillOpacity={0.05} /> : null}
            {data.caseness.GAD7 !== undefined ? <ReferenceArea y1={data.caseness.GAD7} y2={21} fill={GAD_COLOR} fillOpacity={0.04} /> : null}
            {data.caseness.PHQ9 !== undefined ? (
              <ReferenceLine y={data.caseness.PHQ9} stroke={PHQ_COLOR} strokeDasharray="5 4" strokeOpacity={0.7} label={{ value: `PHQ-9 ${t("caseness")} ${data.caseness.PHQ9}`, position: "insideTopRight", fontSize: 11, fill: "var(--text-muted)" }} />
            ) : null}
            {data.caseness.GAD7 !== undefined ? (
              <ReferenceLine y={data.caseness.GAD7} stroke={GAD_COLOR} strokeDasharray="5 4" strokeOpacity={0.7} label={{ value: `GAD-7 ${t("caseness")} ${data.caseness.GAD7}`, position: "insideBottomLeft", fontSize: 11, fill: "var(--text-muted)" }} />
            ) : null}
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis domain={[0, 27]} ticks={[0, 5, 10, 15, 20, 27]} tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="phq9" name={t("phq")} stroke={PHQ_COLOR} strokeWidth={3} dot={makeDot(PHQ_COLOR, phqRc)} activeDot={{ r: 6 }} isAnimationActive={!reduce} animationDuration={1200} connectNulls />
            <Line type="monotone" dataKey="gad7" name={t("gad")} stroke={GAD_COLOR} strokeWidth={3} dot={makeDot(GAD_COLOR, gadRc)} activeDot={{ r: 6 }} isAnimationActive={!reduce} animationDuration={1200} animationBegin={200} connectNulls />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 rounded bg-[var(--chart-jisr)]" />
          {t("phq")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-0.5 w-4 rounded bg-[var(--chart-2)]" />
          {t("gad")}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="size-3 rounded-full border border-dashed border-ink-muted" />
          {t("reliable")}
        </span>
        <span>{t("note")}</span>
        {data.rci_thresholds.PHQ9 !== undefined && data.rci_thresholds.GAD7 !== undefined ? (
          <span>{t("rciNote", { phq: data.rci_thresholds.PHQ9, gad: data.rci_thresholds.GAD7 })}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
