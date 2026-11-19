"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, type ChatMessage, type CompanionReply, type Language } from "@/lib/api";
import { orderCrisisLines } from "@/lib/crisis";
import { useAuth, useSessionJson } from "@/lib/hooks";
import { K, writeJson } from "@/lib/session";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Badge, Icon, btn } from "../ui";
import { EASE } from "../motion";

interface Msg extends ChatMessage {
  id: number;
  meta?: Pick<CompanionReply, "content_type" | "provider" | "validator">;
}

type Gate = { kind: "idle" } | { kind: "checking" } | { kind: "clear"; ms: number; n: number } | { kind: "hit"; ms: number; rules: string[]; sameDay: boolean };

function GateStrip({ gate }: { gate: Gate }) {
  const t = useTranslations("companion");
  const reduce = useReducedMotion();
  const hit = gate.kind === "hit";
  const label =
    gate.kind === "idle" ? t("gateIdle") : gate.kind === "checking" ? t("gateChecking") : gate.kind === "clear" ? (gate.ms < 1 ? t("gateClearFast") : t("gateClear", { ms: gate.ms })) : t("gateHit");
  const key = gate.kind === "clear" ? `clear-${gate.n}` : gate.kind;
  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative overflow-hidden rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors duration-300 ${
        hit ? "border-help bg-help text-on-help" : gate.kind === "clear" ? "border-green/30 bg-green-bg text-green" : "border-line bg-surface text-ink-muted"
      }`}
    >
      {gate.kind === "checking" && !reduce ? (
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary/15 to-transparent"
          initial={{ left: "-35%" }}
          animate={{ left: "105%" }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      ) : null}
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={key}
          className="relative flex items-center gap-2"
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: EASE }}
        >
          <Icon name={hit ? "lock" : gate.kind === "clear" ? "check" : "shield"} className="size-4 shrink-0" />
          <span>{label}</span>
          {gate.kind === "clear" && !reduce ? (
            <motion.span aria-hidden className="ms-auto size-2 rounded-full bg-green" initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} />
          ) : null}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

function CrisisPanel({ sameDay, ms, rules }: { sameDay: boolean; ms: number; rules: string[] }) {
  const t = useTranslations("companion");
  const tcr = useTranslations("crisis");
  const lines = orderCrisisLines(sameDay ? "same_day_check" : "emergency");
  return (
    <div className="rounded-[24px] border-2 border-help/50 bg-surface p-5">
      <p className="flex items-center gap-2 text-lg font-semibold text-help">
        <Icon name="lock" className="size-5" />
        {t("gateHit")}
      </p>
      <p className="mt-1">{t("gateHitBody")}</p>
      <ul className="mt-4 grid gap-2 sm:grid-cols-3">
        {lines.map((l) => (
          <li key={l.id}>
            <a href={l.tel} aria-label={tcr("callLabel", { name: tcr(`names.${l.id}`), number: l.number })} className="flex min-h-14 flex-col justify-center rounded-2xl bg-help px-4 py-2 text-on-help">
              <span className="text-sm font-semibold">{tcr(`names.${l.id}`)}</span>
              <bdi dir="ltr" className="tabular text-xl font-bold">
                {l.number}
              </bdi>
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/help?alerted=1&urgency=${sameDay ? "same_day_check" : "emergency"}&ms=${ms}`} className={btn.help}>
          <Icon name="phone" />
          {t("openHelp")}
        </Link>
        {rules.length > 0 ? (
          <span className="font-mono text-xs text-ink-muted">
            <bdi dir="ltr">{t("rules", { rules: rules.join(", ") })}</bdi>
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function CompanionChat() {
  const t = useTranslations("companion");
  const tb = useTranslations("badges");
  const locale = useLocale() as Language;
  const router = useRouter();
  const reduce = useReducedMotion();
  const sessionLocked = useSessionJson<boolean>(K.llmLocked) === true;
  const auth = useAuth();
  // The crisis demo chip is hidden for Mariam: a crisis would flip her L2 episode to RED and block the hand-off demo.
  const showDemoChip = auth?.persona !== "mariam";
  const episodeId = useSessionJson<string>(K.episodeId);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [gate, setGate] = useState<Gate>({ kind: "idle" });
  const [suggestions, setSuggestions] = useState<string[] | null>(null);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);
  const checks = useRef(0);

  const locked = gate.kind === "hit" || sessionLocked;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "end" });
  }, [msgs, gate, reduce]);

  async function send(raw: string) {
    const content = raw.trim();
    if (!content || busy || locked) return;
    const userMsg: Msg = { id: nextId.current++, role: "user", content };
    const history: ChatMessage[] = [...msgs, userMsg].map(({ role, content: c }) => ({ role, content: c }));
    setMsgs((m) => [...m, userMsg]);
    setText("");
    setBusy(true);
    setGate({ kind: "checking" });
    try {
      const r = await api.companionChat({ messages: history, language: locale, episode_id: episodeId ?? null });
      if (r.gate.crisis || r.llm_locked) {
        writeJson(K.llmLocked, true);
        if (r.episode_id) writeJson(K.episodeId, r.episode_id);
        setGate({ kind: "hit", ms: r.gate.latency_ms, rules: r.gate.matched_rule_ids ?? [], sameDay: r.gate.severity === "same_day_check" });
      } else {
        checks.current += 1;
        setGate({ kind: "clear", ms: r.gate.latency_ms, n: checks.current });
      }
      if (r.reply) {
        setMsgs((m) => [...m, { id: nextId.current++, role: "assistant", content: r.reply, meta: { content_type: r.content_type, provider: r.provider, validator: r.validator } }]);
      }
      setSuggestions(r.suggestions && r.suggestions.length > 0 ? r.suggestions : null);
    } catch {
      // Fail closed: if the gate can't be reached, show help.
      writeJson(K.llmLocked, true);
      router.replace("/help?urgency=emergency&failclosed=1");
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(text);
  }

  const chips = suggestions ?? [t("ex1"), t("ex2"), t("ex3")];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="headline text-3xl sm:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-ink-muted">{t("subtitle")}</p>
      </div>

      <div className="sticky top-[7.25rem] z-10">
        <GateStrip gate={gate} />
      </div>

      <div className="card flex min-h-[22rem] flex-col gap-3 p-4 sm:p-5" aria-live="polite">
        <Bubble role="assistant" content={t("welcome")} label={t("bot")} />
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
              <Bubble
                role={m.role}
                content={m.content}
                label={m.role === "user" ? t("you") : t("bot")}
                badges={
                  m.meta ? (
                    <>
                      {m.meta.content_type === "ai_drafted" ? (
                        <Badge tone="ai">
                          <Icon name="sparkles" className="size-3" />
                          {t("aiBadge")}
                        </Badge>
                      ) : (
                        <Badge tone="neutral">{t("templateBadge")}</Badge>
                      )}
                      {m.meta.validator?.result === "pass" ? (
                        <Badge tone="ok">
                          <Icon name="check" className="size-3" />
                          {t("validatorPass")}
                        </Badge>
                      ) : null}
                      <span className="font-mono text-[11px] text-ink-faint">{m.meta.provider}</span>
                    </>
                  ) : null
                }
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {busy ? (
          <div className="flex items-center gap-1.5 ps-2 text-ink-faint" aria-label={t("sending")}>
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="size-2 rounded-full bg-current" animate={reduce ? undefined : { opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }} />
            ))}
          </div>
        ) : null}
        {gate.kind === "hit" ? (
          <motion.div initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
            <CrisisPanel sameDay={gate.sameDay} ms={gate.ms} rules={gate.rules} />
          </motion.div>
        ) : null}
        <div ref={endRef} />
      </div>

      {locked ? (
        <p className="flex items-center gap-2 rounded-2xl border border-help/30 bg-surface px-4 py-3 text-sm text-help">
          <Icon name="lock" />
          {t("lockedNote")}
          <Link href="/help?alerted=1" className="ms-auto font-semibold underline">
            {t("openHelp")}
          </Link>
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink-faint">{suggestions ? t("suggestionsLabel") : t("tryLabel")}</span>
            {chips.map((c) => (
              <button key={c} type="button" dir="auto" className={btn.chip} onClick={() => void send(c)} disabled={busy}>
                {c}
              </button>
            ))}
          </div>
          {showDemoChip ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-ink-faint">{t("demoLabel")}</span>
              {[t("exCrisis"), t("exCrisis2")].map((c) => (
                <button key={c} type="button" dir="ltr" className={`${btn.chip} border-dashed border-help/40 text-help`} onClick={() => void send(c)} disabled={busy}>
                  <Icon name="shield" className="size-3.5" />
                  {c}
                </button>
              ))}
            </div>
          ) : null}
          <form onSubmit={onSubmit} className="card-glass flex items-end gap-2 p-2">
            <label htmlFor="companion-input" className="sr-only">
              {t("inputLabel")}
            </label>
            <textarea
              id="companion-input"
              dir="auto"
              rows={2}
              maxLength={1000}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(text);
                }
              }}
              placeholder={t("placeholder")}
              className="block max-h-40 min-h-12 flex-1 resize-none bg-transparent px-3 py-2 text-base outline-none placeholder:text-ink-faint"
              disabled={busy}
            />
            <button type="submit" className={`${btn.primary} px-5`} disabled={busy || !text.trim()}>
              <Icon name="send" className="size-4 rtl:-scale-x-100" />
              <span className="sr-only sm:not-sr-only">{busy ? t("sending") : t("send")}</span>
            </button>
          </form>
          <p className="text-xs text-ink-faint">{tb("aiHint")}</p>
        </>
      )}
    </div>
  );
}

function Bubble({ role, content, label, badges }: { role: "user" | "assistant"; content: string; label: string; badges?: ReactNode }) {
  const mine = role === "user";
  return (
    <div className={`flex flex-col gap-1 ${mine ? "items-end" : "items-start"}`}>
      <span className="px-2 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">{label}</span>
      <p
        dir="auto"
        className={`max-w-[85%] whitespace-pre-wrap rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed ${
          mine ? "rounded-ee-md bg-pill text-on-pill" : "rounded-es-md border border-line bg-surface-muted text-ink"
        }`}
      >
        {content}
      </p>
      {badges ? <div className="flex flex-wrap items-center gap-1.5 px-1">{badges}</div> : null}
    </div>
  );
}
