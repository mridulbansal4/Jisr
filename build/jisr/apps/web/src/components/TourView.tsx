"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, problemMessage, type Persona } from "@/lib/api";
import { currentPasscode } from "@/lib/judge";
import { K, clearPersonFlow, getAuth, setAuthFromToken, writeJson } from "@/lib/session";
import { Alert, Badge, Icon, btn } from "./ui";
import { Aurora, Reveal } from "./motion";

type Href = "/me/screen" | "/me/companion" | "/staff" | "/programme" | "/safety";

const STOPS: { id: "s1" | "s2" | "s3" | "s4" | "s5" | "s6"; persona: Persona | null; href: Href; fresh?: boolean }[] = [
  { id: "s1", persona: "mariam", href: "/me/screen", fresh: true },
  { id: "s2", persona: "imran", href: "/me/companion" },
  { id: "s3", persona: "khalid", href: "/staff" },
  { id: "s4", persona: "dr_salma", href: "/staff" },
  { id: "s5", persona: "programme_lead", href: "/programme" },
  { id: "s6", persona: null, href: "/safety" },
];

export function TourView() {
  const t = useTranslations("tour");
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(stop: (typeof STOPS)[number]) {
    setBusy(stop.id);
    setError(null);
    try {
      if (stop.persona) {
        const current = getAuth();
        if (!current || current.persona !== stop.persona) {
          const passcode = currentPasscode();
          const tok = await api.demoLogin(stop.persona, passcode);
          writeJson(K.passcode, passcode);
          if (tok.role === "person") clearPersonFlow();
          setAuthFromToken(tok, stop.persona);
        } else if (stop.fresh) {
          clearPersonFlow();
        }
      }
      router.push(stop.href);
    } catch (e) {
      setError(`${t("failed")} (${problemMessage(e)})`);
      setBusy(null);
    }
  }

  return (
    <main id="main" className="relative isolate overflow-hidden">
      <Aurora variant="soft" />
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-20 pt-14">
        <Link href="/" className={`${btn.ghost} px-0`}>
          <span aria-hidden className="rtl:rotate-180">←</span> {t("back")}
        </Link>
        <h1 className="headline mt-4 text-4xl sm:text-6xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-ink-muted">{t("intro")}</p>
        <p className="mt-2 text-sm text-ink-faint">{t("tip")}</p>
        <div aria-live="polite" className="mt-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
        </div>
        <ol className="relative mt-8 space-y-4 border-s border-dashed border-line-strong ps-8">
          {STOPS.map((s, i) => (
            <Reveal as="li" key={s.id} delay={i * 0.05} className="relative">
              <span aria-hidden className="absolute -start-[2.85rem] top-6 flex size-7 items-center justify-center rounded-full bg-pill text-xs font-bold text-on-pill tabular">
                {i + 1}
              </span>
              <div className="card lift flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-ink-faint">{t("stop", { n: i + 1 })}</span>
                    <Badge tone="primary">{t(`stops.${s.id}.who`)}</Badge>
                  </div>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight">{t(`stops.${s.id}.title`)}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{t(`stops.${s.id}.body`)}</p>
                </div>
                <button type="button" className={`${btn.primary} shrink-0`} disabled={busy !== null} onClick={() => void go(s)}>
                  {busy === s.id ? t("going") : t("go")}
                  <Icon name="arrow" className="size-4 rtl:rotate-180" />
                </button>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </main>
  );
}
