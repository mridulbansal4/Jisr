"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { K, clearSession, writeJson } from "@/lib/session";
import { useSessionJson } from "@/lib/hooks";
import { PageFade } from "./motion";
import { Icon, btn } from "./ui";

const EXIT_URL = process.env.NEXT_PUBLIC_QUICK_EXIT_URL || "https://www.ncm.gov.ae";

/** F-14 quick exit: wipe tab state and replace history so Back doesn't return. */
export function quickExit(): void {
  clearSession();
  window.location.replace(EXIT_URL);
}

const NAV = [
  { href: "/me", key: "home", icon: "door" },
  { href: "/me/screen", key: "check", icon: "clipboard" },
  { href: "/me/companion", key: "companion", icon: "chat" },
  { href: "/me/plan", key: "plan", icon: "activity" },
] as const;

export function PersonShell({ title, children, showHelp = true, wide = false }: { title: string; children: ReactNode; showHelp?: boolean; wide?: boolean }) {
  const t = useTranslations("person");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const discreet = useSessionJson<boolean>(K.discreet) === true;
  const locked = useSessionJson<boolean>(K.llmLocked) === true;
  const escTimes = useRef<number[]>([]);
  const pathname = usePathname();
  const onHelp = pathname === "/help";

  useEffect(() => {
    const apply = () => {
      document.title = discreet ? t("discreetTitle") : `${title} · ${tc("appName")}`;
    };
    apply();
    // Next's metadata may rewrite <title> after a client navigation; re-apply once it settles.
    const id = setTimeout(apply, 150);
    return () => clearTimeout(id);
  }, [discreet, title, t, tc]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      const now = Date.now();
      escTimes.current = [...escTimes.current.filter((x) => now - x < 2000), now];
      if (escTimes.current.length >= 3) quickExit();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const max = wide ? "max-w-3xl" : "max-w-2xl";

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] pb-28">
      <header className="glass-nav sticky top-0 z-20 border-b border-line">
        <div className={`mx-auto flex ${max} items-center gap-2 px-4 py-2`}>
          <span className="text-base font-bold tracking-tight">{discreet ? t("discreetTitle") : tc("appName")}</span>
          <label className="ms-auto inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm">
            <input
              type="checkbox"
              className="size-5 accent-[var(--primary)]"
              checked={discreet}
              onChange={(e) => writeJson(K.discreet, e.target.checked)}
            />
            {t("discreet")}
          </label>
          <button type="button" onClick={quickExit} aria-label={t("exitLabel")} title={t("exitHint")} className={`${btn.secondary} font-semibold`}>
            <Icon name="door" />
            {t("exit")}
          </button>
        </div>
        {onHelp ? null : (
          <nav aria-label={tc("appName")} className={`mx-auto ${max} px-4`}>
            <ul className="-mb-px flex gap-1 overflow-x-auto [scrollbar-width:none]">
              {NAV.map((n) => {
                const active = n.href === "/me" ? pathname === "/me" : pathname.startsWith(n.href);
                return (
                  <li key={n.href} className="flex-1">
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap border-b-2 px-3 text-sm font-medium transition-colors ${
                        active ? "border-ink text-ink" : "border-transparent text-ink-muted hover:text-ink"
                      }`}
                    >
                      <Icon name={n.icon} className="size-4" />
                      {tn(n.key)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </header>
      {locked && !onHelp ? (
        <div className={`mx-auto ${max} px-4 pt-3`}>
          <Link href="/help?alerted=1" className="flex min-h-11 items-center gap-2 rounded-lg border border-help/40 bg-surface px-4 text-help">
            <Icon name="phone" />
            <span className="font-medium">{t("helpNumbers")}</span>
          </Link>
        </div>
      ) : null}
      <main id="main" className={`mx-auto ${max} px-4 pt-8`}>
        {onHelp ? children : <PageFade>{children}</PageFade>}
      </main>
      {showHelp ? (
        <div className="pointer-events-none fixed bottom-4 end-4 z-30">
          <Link href="/help?src=help_button" className={`${btn.help} pointer-events-auto`}>
            <Icon name="phone" className="size-5" />
            {t("helpNow")}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
