"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useAuth } from "@/lib/hooks";
import { LogoMark } from "./Logo";

const LOCALE_LABEL: Record<string, string> = { en: "English", ar: "العربية" };
const PERSONAS = ["mariam", "imran", "dr_salma", "khalid", "programme_lead"] as const;

type Theme = "light" | "dark" | null;

function readTheme(): Theme {
  try {
    const v = window.localStorage.getItem("jisr.theme");
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Theme is a per-viewer convenience (localStorage); the page renders fine without it. */
function ThemeToggle() {
  const t = useTranslations("nav");
  const [theme, setTheme] = useState<Theme>(null);
  useEffect(() => {
    const v = readTheme();
    if (v) document.documentElement.dataset.theme = v;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync from storage after hydration
    setTheme(v);
  }, []);
  function toggle() {
    const isDark = theme ? theme === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      window.localStorage.setItem("jisr.theme", next);
    } catch {
      /* storage blocked */
    }
    setTheme(next);
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t("theme")}
      title={t("theme")}
      className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface/70 text-ink transition hover:border-line-strong"
    >
      <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}

/** Always-visible Judge Mode bar: synthetic-data label, persona, language, theme, role switch. */
export function SyntheticBanner() {
  const t = useTranslations("common");
  const tp = useTranslations("judge.personas");
  const auth = useAuth();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const personaKey = auth?.persona as (typeof PERSONAS)[number] | undefined;
  const personaName = personaKey && (PERSONAS as readonly string[]).includes(personaKey) ? tp(`${personaKey}.name`) : auth?.persona;

  return (
    <div className="relative z-40 border-b border-line bg-bg/80 text-sm text-ink backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 font-bold tracking-tight" aria-label={t("toJudge")}>
          <LogoMark className="size-6" />
          <span className="hidden sm:inline">{t("appName")}</span>
        </Link>
        <span className="hidden rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink-muted md:inline">{t("judgeMode")}</span>
        <span role="note" className="inline-flex items-center gap-1.5 text-xs font-semibold text-help">
          <span aria-hidden className="size-1.5 rounded-full bg-help" />
          {t("syntheticBanner")}
        </span>
        {auth ? <span className="hidden text-xs text-ink-muted lg:inline">{t("signedInAs", { persona: personaName ?? "" })}</span> : null}
        <div className="ms-auto flex items-center gap-2">
          <label className="sr-only" htmlFor="locale-select">
            {t("language")}
          </label>
          <select
            id="locale-select"
            value={locale}
            onChange={(e) => router.replace(pathname, { locale: e.target.value })}
            className="min-h-11 rounded-full border border-line bg-surface/70 px-3 text-sm"
          >
            {routing.locales.map((l) => (
              <option key={l} value={l} lang={l}>
                {LOCALE_LABEL[l] ?? l}
              </option>
            ))}
          </select>
          <ThemeToggle />
          {pathname !== "/" ? (
            <Link href="/" className="inline-flex min-h-11 items-center rounded-full px-3 font-semibold text-primary underline-offset-4 hover:underline">
              {t("switchRole")}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
