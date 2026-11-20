"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, problemMessage, type Persona } from "@/lib/api";
import { currentPasscode } from "@/lib/judge";
import { K, clearPersonFlow, getAuth, setAuthFromToken, writeJson } from "@/lib/session";
import { Alert, Icon, btn } from "./ui";
import { Reveal } from "./motion";

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
    <main id="main">
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-14">
        <Link href="/" className={`${btn.ghost} px-0`}>
          <span aria-hidden className="rtl:rotate-180">←</span> {t("back")}
        </Link>
        <h1 className="display mt-4 text-[2.75rem] sm:text-6xl">{t("title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t("intro")}</p>
        <p className="mt-2 text-sm text-ink-muted">{t("tip")}</p>
        <div aria-live="polite" className="mt-4">
          {error ? <Alert tone="error">{error}</Alert> : null}
        </div>
        <ol className="mt-10 space-y-3">
          {STOPS.map((s, i) => (
            <Reveal as="li" key={s.id}>
              <div className="card lift flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <span aria-hidden className="hidden w-8 shrink-0 font-mono text-sm tabular text-ink-muted sm:block">{String(i + 1).padStart(2, "0")}</span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="label-quiet sm:sr-only">{t("stop", { n: i + 1 })}</span>
                    <span className="label-quiet text-ink">{t(`stops.${s.id}.who`)}</span>
                  </div>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight">{t(`stops.${s.id}.title`)}</h2>
                  <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink-muted">{t(`stops.${s.id}.body`)}</p>
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
