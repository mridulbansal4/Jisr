import { useTranslations } from "next-intl";

/** Jisr mark: a bridge arc on the accent tile. Decorative; the word carries the name. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      <rect width="32" height="32" rx="8" fill="var(--primary)" />
      <path d="M6 21c3.2-6.5 6.6-9 10-9s6.8 2.5 10 9" fill="none" stroke="var(--on-primary)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 23.5h20M11 23.5v-4.6M16 23.5v-7M21 23.5v-4.6" stroke="var(--on-primary)" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function Logo({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("common");
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      {compact ? null : <span className="text-lg font-bold tracking-tight">{t("appName")}</span>}
    </span>
  );
}
