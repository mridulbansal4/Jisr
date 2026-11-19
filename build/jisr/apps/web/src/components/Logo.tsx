import { useTranslations } from "next-intl";

/** Jisr mark: a bridge arc over a gradient disc. Decorative; the word carries the name. */
export function LogoMark({ className = "size-7" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 32 32" className={className}>
      <defs>
        <linearGradient id="jisr-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff7a45" />
          <stop offset="0.55" stopColor="#d9467a" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="10" fill="url(#jisr-g)" />
      <path d="M6 21c3.2-6.5 6.6-9 10-9s6.8 2.5 10 9" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 23.5h20M11 23.5v-4.6M16 23.5v-7M21 23.5v-4.6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
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
