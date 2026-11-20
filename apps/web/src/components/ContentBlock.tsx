import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "./ui";

export type ContentType = "observed" | "calculated" | "ai" | "standard";

const styles: Record<ContentType, { box: string; badge: string; icon: "clipboard" | "calculator" | "sparkles" }> = {
  observed: { box: "border-line bg-surface", badge: "label-quiet text-observed", icon: "clipboard" },
  calculated: { box: "border-line bg-surface", badge: "label-quiet text-calc", icon: "calculator" },
  standard: { box: "border-line bg-surface", badge: "rounded-full bg-calc-bg px-2.5 py-1 text-xs font-semibold text-calc", icon: "calculator" },
  ai: { box: "border-dashed border-ai/50 bg-ai-bg/40", badge: "rounded-full bg-ai-bg px-2.5 py-1 text-xs font-semibold text-ai", icon: "sparkles" },
};

/**
 * One container per content type (CLAUDE.md: Observed · Calculated · AI-drafted
 * never share a container). Colour + icon + text label, so colour is never the only cue.
 */
export function ContentBlock({
  type,
  title,
  meta,
  children,
  headingLevel = 2,
}: {
  type: ContentType;
  title?: string;
  meta?: ReactNode;
  children: ReactNode;
  headingLevel?: 2 | 3;
}) {
  const t = useTranslations("badges");
  const s = styles[type];
  const label = type === "observed" ? t("observed") : type === "ai" ? t("ai") : type === "standard" ? t("standard") : t("calculated");
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <section className={`rounded-[12px] border p-5 sm:p-6 ${s.box}`} data-content-type={type}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className={`inline-flex items-center gap-1.5 ${s.badge}`}>
          <Icon name={s.icon} className="size-3.5" />
          {label}
        </span>
        {title ? <H className="text-lg font-semibold tracking-tight">{title}</H> : null}
        {meta ? <span className="ms-auto max-w-full font-mono text-xs text-ink-muted [overflow-wrap:anywhere]">{meta}</span> : null}
      </div>
      {children}
    </section>
  );
}

export function GateBadge({ tone = "neutral", icon = "shield", children }: { tone?: "neutral" | "locked" | "ok"; icon?: "shield" | "lock" | "check"; children: ReactNode }) {
  const cls =
    tone === "locked"
      ? "border-help/40 text-help"
      : tone === "ok"
        ? "border-green/40 text-green"
        : "border-line-strong text-ink-muted";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border bg-surface px-3 py-1 text-xs font-medium ${cls}`}>
      <Icon name={icon} className="size-3.5" />
      {children}
    </span>
  );
}
