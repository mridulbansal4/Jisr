"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { API_URL, api, problemMessage, type CrisisEval, type Persona, type SimResult } from "@/lib/api";
import { K, clearPersonFlow, homeForRole, setAuthFromToken, writeJson } from "@/lib/session";
import { useSessionJson } from "@/lib/hooks";
import { judgeToken } from "@/lib/judge";
import { Alert, Icon, btn, input } from "./ui";
import { ContentBlock } from "./ContentBlock";
import { Reveal, motion, useReducedMotion } from "./motion";

const PERSONAS: Exclude<Persona, "judge">[] = ["mariam", "imran", "dr_salma", "khalid", "programme_lead"];

const FLOW = ["screen", "gate", "step", "handoff", "outcome"] as const;

/* ------------------------------------------------------------------ */

function Hero() {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  return (
    <section className="relative isolate">
      <div aria-hidden className="sky" />
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto max-w-5xl px-4 pb-20 pt-16 text-center sm:pb-28 sm:pt-24"
      >
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="display mx-auto mt-6 max-w-4xl text-[2.75rem] text-ink sm:text-7xl lg:text-[5.25rem]">
          {t("h1a")}
          <br />
          <span className="text-dawn pe-1 italic rtl:not-italic">{t("h1b")}</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted sm:text-xl">{t("sub")}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/tour" className={btn.primary}>
            {t("ctaTour")}
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </Link>
          <a href="#personas" className={btn.secondary}>
            {t("ctaPersonas")}
          </a>
          <Link href="/safety" className={btn.ghost}>
            {t("ctaSafety")}
          </Link>
        </div>
        <p className="mt-8 text-sm text-ink-muted">
          <span aria-hidden className="live-dot me-2 align-middle" />
          <span className="label-quiet me-2 text-ink">{t("newTag")}</span>
          <Link href="/safety" className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink hover:decoration-ink">
            {t("newNote")}
          </Link>
        </p>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const RAILS = ["IFHAS", "Malaffi", "Sahatna", "Thiqa", "DoH Standard of Care 2025", "DoH Responsible AI Standard", "800-SAKINA", "Federal Law 2/2019", "FHIR R4"];

function Rails() {
  const t = useTranslations("landing");
  return (
    <section aria-label={t("railsEyebrow")} className="mx-auto max-w-6xl px-4 py-10">
      <p className="eyebrow text-center">{t("railsEyebrow")}</p>
      <div className="ticker mx-auto mt-5 max-w-5xl">
        <ul className="ticker-track gap-12 pe-12">
          {[...RAILS, ...RAILS].map((r, i) => (
            <li key={i} aria-hidden={i >= RAILS.length} className="display whitespace-nowrap text-xl text-ink-muted sm:text-2xl">
              {r}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-5 text-center text-sm text-ink-muted">{t("railsNote")}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StatCard({ value, label, tag, source }: { value: ReactNode; label: string; tag: string; source?: string }) {
  return (
    <div className="card spotlight flex flex-col p-6">
      <span className="label-quiet">{tag}</span>
      <p className="headline tabular mt-5 whitespace-nowrap text-4xl sm:text-5xl lg:text-[2.125rem] xl:text-5xl">{value}</p>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted">{label}</p>
      {source ? <p className="mt-auto pt-4 text-sm text-ink-faint">{source}</p> : null}
    </div>
  );
}

function Problem() {
  const t = useTranslations("landing");
  const [sim, setSim] = useState<SimResult | null>(null);
  const [evalRes, setEvalRes] = useState<CrisisEval | null>(null);
  useEffect(() => {
    let cancelled = false;
    judgeToken()
      .then((tok) =>
        Promise.allSettled([api.runSimulation({ cohort_size: 5000, seed: 42 }, tok), api.getCrisisEval(tok)]).then(([s, e]) => {
          if (cancelled) return;
          if (s.status === "fulfilled") setSim(s.value);
          if (e.status === "fulfilled") setEvalRes(e.value);
        }),
      )
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("problemEyebrow")}</p>
        <h2 className="display mt-4 text-4xl sm:text-[3.25rem]">{t("problemTitle")}</h2>
        <p className="mt-6 text-lg leading-relaxed text-ink-muted">{t("problemBody")}</p>
        <p className="mt-3 text-lg leading-relaxed text-ink-muted">{t("problemBody2")}</p>
      </Reveal>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tag={t("sourcedTag")} value="16.3%" label={t("stat1Label")} source={t("stat1Source")} />
        <StatCard tag={t("sourcedTag")} value={(1930).toLocaleString("en")} label={t("stat2Label")} source={t("stat2Source")} />
        {sim ? (
          <StatCard
            tag={t("simTag")}
            value={
              <bdi dir="ltr">
                <span className="text-ink-faint">{Math.round(sim.baseline.conversion_pct)}%</span>
                <span className="mx-1 text-[0.6em] text-ink-faint">→</span>
                {Math.round(sim.jisr.conversion_pct)}%
              </bdi>
            }
            label={t("statConvLabel")}
          />
        ) : (
          <div className="card flex flex-col p-6 text-[0.9375rem] text-ink-muted">
            <span className="label-quiet mb-4">{t("simTag")}</span>
            {t("statsUnavailable")}
          </div>
        )}
        {evalRes ? (
          <StatCard tag={t("benchTag")} value={`${(evalRes.recall * 100).toFixed(evalRes.recall === 1 ? 0 : 1)}%`} label={t("statRecallLabel", { n: evalRes.n })} />
        ) : sim ? (
          <StatCard
            tag={t("simTag")}
            value={
              <bdi dir="ltr">
                <span className="text-ink-faint">{Math.round(sim.baseline.median_days_to_care)}</span>
                <span className="mx-1 text-[0.6em] text-ink-faint">→</span>
                {Math.round(sim.jisr.median_days_to_care)}
              </bdi>
            }
            label={t("statDaysLabel")}
          />
        ) : null}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FlowSteps() {
  const t = useTranslations("landing");
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("flowEyebrow")}</p>
        <h2 className="display mt-4 text-4xl sm:text-[3.25rem]">{t("flowTitle")}</h2>
        <p className="mt-5 text-lg leading-relaxed text-ink-muted">{t("flowSub")}</p>
      </Reveal>
      <ol className="mt-12 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5">
        {FLOW.map((k, i) => (
          <li key={k} className="border-t border-line-strong pt-5">
            <span className="font-mono text-sm tabular text-ink-muted">0{i + 1}</span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{t(`flow.${k}.title`)}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{t(`flow.${k}.body`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Unique() {
  const t = useTranslations("landing");
  const items = [
    { k: "gate", icon: "lock" },
    { k: "trace", icon: "sparkles" },
    { k: "clinician", icon: "stethoscope" },
    { k: "employer", icon: "shield" },
  ] as const;
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("uniqueEyebrow")}</p>
        <h2 className="display mt-4 text-4xl sm:text-[3.25rem]">{t("uniqueTitle")}</h2>
      </Reveal>
      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {items.map(({ k, icon }) => (
          <div key={k} className={`card spotlight p-7 ${k === "gate" ? "card-featured" : ""}`}>
            <Icon name={icon} className="size-5 text-ink" />
            <h3 className="mt-5 text-xl font-semibold tracking-tight">{t(`unique.${k}.title`)}</h3>
            <p className="mt-2 leading-relaxed text-ink-muted">{t(`unique.${k}.body`)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Personas({ defaultPasscode }: { defaultPasscode: string }) {
  const t = useTranslations("judge");
  const tl = useTranslations("landing");
  const tc = useTranslations("common");
  const router = useRouter();
  const stored = useSessionJson<string>(K.passcode);
  const [edited, setPasscode] = useState<string | null>(null);
  const passcode = edited ?? stored ?? defaultPasscode;
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function enter(persona: Exclude<Persona, "judge">) {
    setBusy(persona);
    setError(null);
    setNotice(null);
    try {
      const tok = await api.demoLogin(persona, passcode);
      writeJson(K.passcode, passcode);
      if (tok.role === "person") clearPersonFlow();
      setAuthFromToken(tok, persona);
      router.push(homeForRole(tok.role));
    } catch (e) {
      setError(`${t("loginFailed")} (${problemMessage(e)})`);
      setBusy(null);
    }
  }

  async function reset() {
    if (!window.confirm(t("resetConfirm"))) return;
    setBusy("reset");
    setError(null);
    setNotice(null);
    try {
      const tok = await api.demoLogin("judge", passcode);
      writeJson(K.passcode, passcode);
      const r = await api.demoReset(tok.access_token);
      clearPersonFlow();
      setNotice(t("resetDone", { count: r.episodes_seeded ?? 0 }));
    } catch (e) {
      setError(`${t("resetFailed")} (${problemMessage(e)})`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <section id="personas" className="scroll-mt-16 py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{tl("personasEyebrow")}</p>
            <h2 className="display mt-4 text-4xl sm:text-[3.25rem]">{tl("personasTitle")}</h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{tl("personasSub")}</p>
          </div>
          <Link href="/tour" className={btn.secondary}>
            {tl("ctaTour")}
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </Link>
        </Reveal>

        <div className="card mt-10 p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="min-w-60 flex-1">
              <label htmlFor="passcode" className="mb-1 block text-sm font-semibold">
                {t("passcodeLabel")}
              </label>
              <input
                id="passcode"
                type="password"
                autoComplete="off"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className={input}
                aria-describedby="passcode-help"
              />
              <p id="passcode-help" className="mt-1 text-sm text-ink-muted">
                {t("passcodeHelp")}
              </p>
            </div>
            <button type="button" onClick={reset} disabled={busy !== null || !passcode} className={btn.secondary}>
              {busy === "reset" ? t("resetting") : t("reset")}
            </button>
          </div>
          <p className="mt-3 font-mono text-xs text-ink-muted">{tc("apiTarget", { url: API_URL })}</p>
        </div>

        <div aria-live="polite" className="mt-4 space-y-2">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}
        </div>

        <h3 className="sr-only">{t("choose")}</h3>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PERSONAS.map((id) => (
            <li key={id}>
              <div className="card lift spotlight flex h-full flex-col p-5">
                <span className="label-quiet">{t(`personas.${id}.role`)}</span>
                <h4 className="mt-3 font-display text-2xl leading-tight">{t(`personas.${id}.name`)}</h4>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{t(`personas.${id}.desc`)}</p>
                <button type="button" onClick={() => enter(id)} disabled={busy !== null || !passcode} className={`${btn.primary} mt-5 w-full px-4 text-sm`}>
                  {busy === id ? t("signingIn") : t("enter", { name: t(`personas.${id}.name`) })}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Legend() {
  const t = useTranslations("judge");
  const tb = useTranslations("badges");
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <h2 className="text-2xl font-semibold tracking-tight">{t("legendTitle")}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ContentBlock type="observed" headingLevel={3}>
          <p className="text-[0.9375rem] leading-relaxed">{tb("observedHint")}</p>
        </ContentBlock>
        <ContentBlock type="calculated" headingLevel={3}>
          <p className="text-[0.9375rem] leading-relaxed">{tb("calculatedHint")}</p>
        </ContentBlock>
        <ContentBlock type="ai" headingLevel={3}>
          <p className="text-[0.9375rem] leading-relaxed">{tb("aiHint")}</p>
        </ContentBlock>
      </div>
    </section>
  );
}

export function JudgeLanding({ defaultPasscode }: { defaultPasscode: string }) {
  const tl = useTranslations("landing");
  return (
    <main id="main">
      <Hero />
      <Rails />
      <Problem />
      <FlowSteps />
      <Unique />
      <Personas defaultPasscode={defaultPasscode} />
      <Legend />
      <footer className="mx-auto max-w-6xl border-t border-line px-4 py-10 text-center text-sm text-ink-muted">{tl("footer")}</footer>
    </main>
  );
}
