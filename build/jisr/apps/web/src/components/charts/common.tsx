"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useReducedMotion } from "../motion";
import { Reveal } from "../motion";

export const PALETTE = {
  jisr: "var(--chart-jisr)",
  baseline: "var(--chart-baseline)",
  coral: "var(--chart-2)",
  teal: "var(--chart-3)",
  amber: "var(--chart-4)",
};

export const tooltipStyle = {
  contentStyle: { borderRadius: 14, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-card)", fontSize: 12 },
  labelStyle: { color: "var(--text)", fontWeight: 600 },
  itemStyle: { color: "var(--text-muted)" },
  cursor: { stroke: "var(--border-strong)", strokeDasharray: "3 3" },
};

export function SimLabel() {
  const t = useTranslations("programme");
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber/20 bg-amber-bg px-2.5 py-0.5 text-[11px] font-semibold text-amber">
      <span aria-hidden className="size-1.5 rounded-full bg-amber" />
      {t("simulated")}
    </span>
  );
}

export function Panel({
  title,
  sub,
  children,
  extra,
  className = "",
  delay = 0,
}: {
  title: string;
  sub?: string;
  children: ReactNode;
  extra?: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className={`card flex flex-col p-5 sm:p-6 ${className}`}>
      <div className="mb-4">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-lg font-semibold tracking-tight">{title}</h2>
          {extra}
        </div>
        {sub ? <p className="text-sm text-ink-muted">{sub}</p> : null}
        <div className="mt-2">
          <SimLabel />
        </div>
      </div>
      {children}
    </Reveal>
  );
}

export function Sparkline({ values, color = PALETTE.jisr, id }: { values: (number | null)[]; color?: string; id: string }) {
  const reduce = useReducedMotion();
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div dir="ltr" className="h-12 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${id})`} isAnimationActive={!reduce} animationDuration={1100} connectNulls dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
