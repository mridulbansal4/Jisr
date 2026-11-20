"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Reveal } from "../motion";

export const PALETTE = {
  jisr: "var(--chart-jisr)",
  baseline: "var(--chart-baseline)",
  mid: "var(--chart-2)",
  light: "var(--chart-3)",
  dark: "var(--chart-4)",
};

export const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", boxShadow: "var(--shadow-card)", fontSize: 12 },
  labelStyle: { color: "var(--text)", fontWeight: 600 },
  itemStyle: { color: "var(--text-muted)" },
  cursor: { stroke: "var(--border-strong)", strokeDasharray: "3 3" },
};

export function SimLabel() {
  const t = useTranslations("programme");
  return (
    <span className="label-quiet">{t("simulated")}</span>
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
  const data = values.map((v, i) => ({ i, v }));
  return (
    <div dir="ltr" className="h-12 w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.14} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.75} fill={`url(#spark-${id})`} isAnimationActive={false} connectNulls dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
