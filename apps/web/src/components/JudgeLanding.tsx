"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { API_URL, api, problemMessage, type CrisisEval, type Persona, type SimResult } from "@/lib/api";
import { K, clearPersonFlow, homeForRole, setAuthFromToken, writeJson } from "@/lib/session";
import { useSessionJson } from "@/lib/hooks";
import { judgeToken } from "@/lib/judge";
import { Alert, Badge, Icon, btn, input } from "./ui";
import { ContentBlock } from "./ContentBlock";
import { Aurora, CountUp, Reveal, Stagger, StaggerItem, motion, useReducedMotion } from "./motion";

const PERSONAS: { id: Exclude<Persona, "judge">; icon: "users" | "stethoscope" | "alert" | "chart"; tone: string }[] = [
  { id: "mariam", icon: "users", tone: "from-[#ffb08a] to-[#ff7a45]" },
  { id: "imran", icon: "users", tone: "from-[#ffd29a] to-[#f59e0b]" },
  { id: "dr_salma", icon: "stethoscope", tone: "from-[#a5b4fc] to-[#4f46e5]" },
  { id: "khalid", icon: "alert", tone: "from-[#fca5a5] to-[#dc2626]" },
  { id: "programme_lead", icon: "chart", tone: "from-[#99f6e4] to-[#0f766e]" },
];

const FLOW = ["screen", "gate", "step", "handoff", "outcome"] as const;
const FLOW_ICON = { screen: "clipboard", gate: "lock", step: "bridge", handoff: "users", outcome: "activity" } as const;

/* ------------------------------------------------------------------ */

function Hero() {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  return (
    <section className="grain relative isolate overflow-hidden">
      <Aurora />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-16 text-center sm:pt-24">
        <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Link
            href="/safety"
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 py-1 pe-3 ps-1 text-xs text-ink-muted backdrop-blur transition-colors hover:text-ink"
          >
            <span className="rounded-full bg-pill px-2 py-0.5 font-semibold text-on-pill">{t("newTag")}</span>
            {t("newNote")}
            <Icon name="arrow" className="size-3.5 rtl:rotate-180" />
          </Link>
        </motion.div>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.03 }}
          className="eyebrow mt-8"
        >
          {t("eyebrow")}
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.05 }}
          className="display mx-auto mt-4 max-w-4xl text-[2.9rem] sm:text-7xl lg:text-[5.5rem]"
        >
          {t("h1a")}
          <br />
          <span className="text-gradient pe-1 italic">{t("h1b")}</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-ink-muted sm:text-xl"
        >
          {t("sub")}
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          <Link href="/tour" className={btn.primary}>
            <Icon name="play" className="size-4" />
            {t("ctaTour")}
          </Link>
          <a href="#personas" className={btn.secondary}>
            {t("ctaPersonas")}
          </a>
          <Link href="/safety" className={btn.ghost}>
            <Icon name="shield" />
            {t("ctaSafety")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

const RAILS = ["IFHAS", "Malaffi", "Sahatna", "Thiqa", "DoH Standard of Care 2025", "DoH Responsible AI Standard", "800-SAKINA", "Federal Law 2/2019", "FHIR R4"];

function Rails() {
  const t = useTranslations("landing");
  const row = [...RAILS, ...RAILS];
  return (
    <section aria-label={t("railsEyebrow")} className="border-y border-line/70 bg-surface/40 py-8">
      <p className="eyebrow text-center text-ink-faint">{t("railsEyebrow")}</p>
      <div className="marquee relative mt-5 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <ul className="marquee-track gap-12 pe-12">
          {row.map((r, i) => (
            <li key={i} aria-hidden={i >= RAILS.length} className="display whitespace-nowrap text-2xl text-ink-muted sm:text-3xl">
              {r}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-4 text-center text-xs text-ink-faint">{t("railsNote")}</p>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StatCard({ value, label, tag, tone, source }: { value: ReactNode; label: string; tag: string; tone: "sim" | "primary" | "ok"; source?: string }) {
  return (
    <StaggerItem className="card lift relative flex flex-col p-6">
      <Badge tone={tone} className="w-fit">
        {tag}
      </Badge>
      <p className="headline mt-4 text-4xl sm:text-5xl">{value}</p>
      <p className="mt-2 text-ink-muted">{label}</p>
      {source ? <p className="mt-auto pt-3 text-xs text-ink-faint">{source}</p> : null}
    </StaggerItem>
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
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("problemEyebrow")}</p>
        <h2 className="display mt-4 text-4xl sm:text-6xl">{t("problemTitle")}</h2>
        <p className="mt-5 text-lg text-ink-muted">{t("problemBody")}</p>
        <p className="mt-3 text-lg text-ink-muted">{t("problemBody2")}</p>
      </Reveal>
      <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard tone="primary" tag={t("sourcedTag")} value={<><CountUp value={16.3} decimals={1} />%</>} label={t("stat1Label")} source={t("stat1Source")} />
        <StatCard tone="primary" tag={t("sourcedTag")} value={<CountUp value={1930} format={(n) => Math.round(n).toLocaleString("en")} />} label={t("stat2Label")} source={t("stat2Source")} />
        {sim ? (
          <StatCard
            tone="sim"
            tag={t("simTag")}
            value={
              <bdi dir="ltr">
                <span className="text-ink-faint">{Math.round(sim.baseline.conversion_pct)}%</span>
                <span className="mx-1.5 text-2xl text-ink-faint">→</span>
                <CountUp value={sim.jisr.conversion_pct} decimals={0} />%
              </bdi>
            }
            label={t("statConvLabel")}
          />
        ) : (
          <StaggerItem className="card flex flex-col justify-center p-6 text-sm text-ink-muted">
            <Badge tone="sim" className="mb-3 w-fit">{t("simTag")}</Badge>
            {t("statsUnavailable")}
          </StaggerItem>
        )}
        {evalRes ? (
          <StatCard
            tone="ok"
            tag={t("benchTag")}
            value={<><CountUp value={evalRes.recall * 100} decimals={evalRes.recall === 1 ? 0 : 1} />%</>}
            label={t("statRecallLabel", { n: evalRes.n })}
          />
        ) : sim ? (
          <StatCard
            tone="sim"
            tag={t("simTag")}
            value={
              <bdi dir="ltr">
                <span className="text-ink-faint">{Math.round(sim.baseline.median_days_to_care)}</span>
                <span className="mx-1.5 text-2xl text-ink-faint">→</span>
                <CountUp value={sim.jisr.median_days_to_care} decimals={0} />
              </bdi>
            }
            label={t("statDaysLabel")}
          />
        ) : null}
      </Stagger>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function FlowDiagram() {
  const t = useTranslations("landing");
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setActive((a) => (a + 1) % (FLOW.length + 2)), 1400);
    return () => clearInterval(id);
  }, [reduce]);
  const lit = reduce ? FLOW.length : active;

  return (
    <section className="relative isolate overflow-hidden py-20">
      <Aurora variant="soft" className="opacity-70" />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">{t("flowEyebrow")}</p>
          <h2 className="display mt-4 text-4xl sm:text-6xl">{t("flowTitle")}</h2>
          <p className="mt-4 text-lg text-ink-muted">{t("flowSub")}</p>
        </Reveal>
        <ol className="relative mt-14 grid gap-4 lg:grid-cols-5 lg:gap-3">
          {/* connector rail (desktop) */}
          <div aria-hidden className="absolute inset-x-[10%] top-9 hidden h-0.5 rounded-full bg-line lg:block">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-coral via-[#d9467a] to-indigo rtl:bg-gradient-to-l"
              style={{ transformOrigin: "var(--origin)" }}
              animate={{ scaleX: Math.min(lit, FLOW.length - 1) / (FLOW.length - 1) }}
              transition={{ duration: 0.9 }}
            />
          </div>
          {FLOW.map((k, i) => {
            const on = i <= lit - (reduce ? 1 : 0) || reduce;
            const isGate = k === "gate";
            return (
              <Reveal as="li" key={k} delay={i * 0.08} className="relative">
                <div className={`card relative flex h-full flex-col items-start p-5 transition-all duration-500 lg:items-center lg:text-center ${on ? "border-primary/25 shadow-[var(--shadow-lift)]" : ""}`}>
                  <span
                    className={`relative z-10 flex size-12 items-center justify-center rounded-2xl border transition-all duration-500 ${
                      on ? (isGate ? "border-help/30 bg-help text-on-help" : "border-transparent bg-pill text-on-pill") : "border-line bg-surface-muted text-ink-muted"
                    }`}
                  >
                    <Icon name={FLOW_ICON[k]} className="size-5" />
                    {on && !reduce ? (
                      <motion.span
                        aria-hidden
                        className={`absolute inset-0 rounded-2xl ${isGate ? "bg-help" : "bg-indigo"}`}
                        initial={{ opacity: 0.5, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.6 }}
                        transition={{ duration: 1.2 }}
                      />
                    ) : null}
                  </span>
                  <span className="mt-4 text-xs font-semibold tabular text-ink-faint">0{i + 1}</span>
                  <h3 className="mt-1 text-lg font-semibold tracking-tight">{t(`flow.${k}.title`)}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{t(`flow.${k}.body`)}</p>
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
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
    <section className="mx-auto max-w-6xl px-4 py-20">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{t("uniqueEyebrow")}</p>
        <h2 className="display mt-4 text-4xl sm:text-6xl">{t("uniqueTitle")}</h2>
      </Reveal>
      <Stagger className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map(({ k, icon }, i) => (
          <StaggerItem key={k} className="card lift group relative overflow-hidden p-7">
            <div aria-hidden className={`orb ${i % 2 ? "orb-indigo" : "orb-coral"} -end-24 -top-24 size-56 opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
            <span className="relative flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Icon name={icon} className="size-5" />
            </span>
            <h3 className="relative mt-5 text-xl font-semibold tracking-tight">{t(`unique.${k}.title`)}</h3>
            <p className="relative mt-2 text-ink-muted">{t(`unique.${k}.body`)}</p>
          </StaggerItem>
        ))}
      </Stagger>
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
    <section id="personas" className="relative isolate scroll-mt-16 overflow-hidden py-20">
      <Aurora variant="corner" className="opacity-60" />
      <div className="relative z-10 mx-auto max-w-6xl px-4">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="eyebrow">{tl("personasEyebrow")}</p>
            <h2 className="display mt-4 text-4xl sm:text-6xl">{tl("personasTitle")}</h2>
            <p className="mt-3 text-lg text-ink-muted">{tl("personasSub")}</p>
          </div>
          <Link href="/tour" className={btn.primary}>
            <Icon name="play" />
            {tl("ctaTour")}
          </Link>
        </Reveal>

        <div className="card-glass mt-8 p-5">
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
          <p className="mt-3 font-mono text-xs text-ink-faint">{tc("apiTarget", { url: API_URL })}</p>
        </div>

        <div aria-live="polite" className="mt-4 space-y-2">
          {error ? <Alert tone="error">{error}</Alert> : null}
          {notice ? <Alert tone="success">{notice}</Alert> : null}
        </div>

        <h3 className="sr-only">{t("choose")}</h3>
        <Stagger as="ul" className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {PERSONAS.map((p) => (
            <StaggerItem as="li" key={p.id}>
              <div className="card lift flex h-full flex-col p-5">
                <span className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${p.tone} text-white shadow-md`}>
                  <Icon name={p.icon} className="size-5" />
                </span>
                <span className="mt-4 text-xs font-semibold text-primary">{t(`personas.${p.id}.role`)}</span>
                <h4 className="mt-0.5 text-xl font-semibold tracking-tight">{t(`personas.${p.id}.name`)}</h4>
                <p className="mt-1.5 flex-1 text-sm text-ink-muted">{t(`personas.${p.id}.desc`)}</p>
                <button type="button" onClick={() => enter(p.id)} disabled={busy !== null || !passcode} className={`${btn.primary} mt-5 w-full px-4 text-sm`}>
                  {busy === p.id ? t("signingIn") : t("enter", { name: t(`personas.${p.id}.name`) })}
                </button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function Legend() {
  const t = useTranslations("judge");
  const tb = useTranslations("badges");
  return (
    <section className="mx-auto max-w-6xl px-4 pb-20">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight">{t("legendTitle")}</h2>
      </Reveal>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <ContentBlock type="observed" headingLevel={3}>
          <p className="text-sm">{tb("observedHint")}</p>
        </ContentBlock>
        <ContentBlock type="calculated" headingLevel={3}>
          <p className="text-sm">{tb("calculatedHint")}</p>
        </ContentBlock>
        <ContentBlock type="ai" headingLevel={3}>
          <p className="flex items-center gap-2 text-sm">
            <Icon name="shield" />
            {tb("aiHint")}
          </p>
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
      <FlowDiagram />
      <Unique />
      <Personas defaultPasscode={defaultPasscode} />
      <Legend />
      <footer className="border-t border-line py-8 text-center text-sm text-ink-muted">{tl("footer")}</footer>
    </main>
  );
}
