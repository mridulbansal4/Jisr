"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { api, problemMessage, type Language, type ScreeningItem, type ScreeningSession, type Urgency } from "@/lib/api";
import { isCrisisItem, optionsFor, PHQ_GAD_STEM_EN, mergeItems } from "@/lib/instrument";
import { K, writeJson } from "@/lib/session";
import { Alert, Spinner, btn } from "../ui";

export interface StoredAnswers {
  rulesVersion: string;
  answeredAt: string;
  noteGiven: boolean;
  items: { link_id: string; instrument: string; text: string; value: number | boolean }[];
}

type Phase = "loading" | "question" | "note" | "submitting" | "error";

const NOTE_MAX = 500;

export function ScreeningFlow() {
  const t = useTranslations("screen");
  const tn = useTranslations("note");
  const th = useTranslations("home");
  const tc = useTranslations("common");
  const locale = useLocale() as Language;
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<ScreeningSession | null>(null);
  const [items, setItems] = useState<ScreeningItem[]>([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    api
      .createScreening(locale)
      .then((s) => {
        setSession(s);
        setItems(s.items);
        setPhase(s.items.length > 0 ? "question" : "note");
      })
      .catch((e) => {
        setError(`${th("startFailed")} (${problemMessage(e)})`);
        setPhase("error");
      });
  }, [locale, th]);

  useEffect(() => {
    heading.current?.focus();
  }, [index, phase]);

  function persistAnswers(all: Record<string, number | boolean>, noteGiven: boolean) {
    const stored: StoredAnswers = {
      rulesVersion: session?.rule_set_version ?? "",
      answeredAt: new Date().toISOString(),
      noteGiven,
      items: items.filter((i) => i.link_id in all).map((i) => ({ link_id: i.link_id, instrument: i.instrument, text: i.text, value: all[i.link_id] })),
    };
    writeJson(K.answers, stored);
  }

  function goCrisis(opts: { urgency?: Urgency; alerted: boolean; ms?: number; failClosed?: boolean }) {
    writeJson(K.llmLocked, true);
    const q = new URLSearchParams();
    q.set("urgency", opts.urgency ?? "emergency");
    if (opts.alerted) q.set("alerted", "1");
    if (opts.ms !== undefined) q.set("ms", String(opts.ms));
    if (opts.failClosed) q.set("failclosed", "1");
    router.replace(`/help?${q.toString()}`);
  }

  /** Item-9 / server crisis: complete the screening so a RED episode exists, then show help. */
  async function crisisFromAnswers(all: Record<string, number | boolean>) {
    if (!session) return;
    persistAnswers(all, false);
    try {
      const done = await api.completeScreening(session.id);
      writeJson(K.completion, done);
      if (done.episode?.id) writeJson(K.episodeId, done.episode.id);
      goCrisis({ urgency: done.urgency ?? "emergency", alerted: Boolean(done.episode?.id) });
    } catch {
      goCrisis({ urgency: "emergency", alerted: false, failClosed: true });
    }
  }

  async function answer(item: ScreeningItem, value: number | boolean) {
    if (!session || saving) return;
    const all = { ...answers, [item.link_id]: value };
    setAnswers(all);
    setSaving(true);
    setError(null);
    const localCrisis = (isCrisisItem(item) || item.crisis_item === true) && typeof value === "number" && value > 0;
    try {
      const res = await api.submitAnswers(session.id, { answers: { [item.link_id]: value } });
      if (res.crisis || localCrisis) {
        await crisisFromAnswers(all);
        return;
      }
      const merged = mergeItems(items, res.next_items);
      setItems(merged);
      setSaving(false);
      if (index + 1 < merged.length) setIndex(index + 1);
      else setPhase("note");
    } catch (e) {
      setSaving(false);
      if (localCrisis) {
        // Fail closed: we could not reach the gate, but the answer itself is a crisis signal.
        await crisisFromAnswers(all);
        return;
      }
      setError(`${t("saveFailed")} (${problemMessage(e)})`);
    }
  }

  async function submitNote(text: string) {
    if (!session) return;
    setPhase("submitting");
    const trimmed = text.trim();
    persistAnswers(answers, trimmed.length > 0);
    let done;
    try {
      done = await api.completeScreening(session.id);
    } catch {
      goCrisis({ urgency: "emergency", alerted: false, failClosed: true });
      return;
    }
    writeJson(K.completion, done);
    if (done.episode?.id) writeJson(K.episodeId, done.episode.id);
    if (done.crisis) {
      goCrisis({ urgency: done.urgency ?? "emergency", alerted: Boolean(done.episode?.id) });
      return;
    }
    if (trimmed) {
      try {
        // F-22: the deterministic Crisis Gate runs on free text before anything else.
        const gate = await api.crisisCheck({ text: trimmed, source: "free_text", language_hint: locale, episode_id: done.episode?.id ?? null });
        if (gate.crisis) {
          goCrisis({ urgency: gate.urgency ?? "emergency", alerted: true, ms: gate.latency_ms });
          return;
        }
      } catch {
        goCrisis({ urgency: "emergency", alerted: false, failClosed: true });
        return;
      }
    }
    router.push("/me/result");
  }

  if (phase === "loading") return <Spinner label={th("starting")} />;
  if (phase === "error")
    return (
      <div className="space-y-4">
        <Alert tone="error">{error}</Alert>
        <button type="button" className={btn.primary} onClick={() => window.location.reload()}>
          {th("start")}
        </button>
      </div>
    );

  if (phase === "note" || phase === "submitting") {
    const busy = phase === "submitting";
    return (
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submitNote(note);
        }}
      >
        <h1 ref={heading} tabIndex={-1} className="headline text-3xl outline-none">
          {tn("title")}
        </h1>
        <label htmlFor="note" className="block text-lg">
          {tn("prompt")}
        </label>
        <textarea
          id="note"
          dir="auto"
          rows={5}
          maxLength={NOTE_MAX}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          aria-describedby="note-help"
          className="block w-full rounded-[20px] border border-line-strong/60 bg-surface p-4 text-lg"
          disabled={busy}
        />
        <div id="note-help" className="flex flex-wrap justify-between gap-2 text-sm text-ink-muted">
          <span className="tabular">{tn("counter", { count: note.length, max: NOTE_MAX })}</span>
          <span>{tn("privacy")}</span>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button type="submit" className={`${btn.primary} sm:flex-1`} disabled={busy}>
            {busy ? tn("checking") : tn("submit")}
          </button>
          <button type="button" className={btn.ghost} disabled={busy} onClick={() => void submitNote("")}>
            {tn("skip")}
          </button>
        </div>
      </form>
    );
  }

  const item = items[index];
  const total = items.length;
  const options = optionsFor(item);
  const selected = answers[item.link_id];
  const showStem = item.instrument !== "CSSRS_SCREEN" && !/diff|10$/i.test(item.link_id);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        {index > 0 ? (
          <button type="button" className={btn.ghost} onClick={() => setIndex(index - 1)} disabled={saving}>
            <span aria-hidden>{locale === "ar" ? "→" : "←"}</span> {tc("back")}
          </button>
        ) : null}
        <p className="ms-auto text-sm text-ink-muted tabular" aria-live="polite">
          {t("progress", { n: index + 1, total })}
        </p>
      </div>
      <div aria-hidden className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        <div className="h-full rounded-full bg-gradient-to-r from-coral to-indigo transition-all duration-500 rtl:bg-gradient-to-l" style={{ width: `${((index + 1) / Math.max(total, 1)) * 100}%` }} />
      </div>

      {locale !== "en" ? (
        <p role="note" className="rounded-2xl border border-observed/30 bg-observed-bg px-4 py-2 text-sm text-observed">
          {t("arPending")}
        </p>
      ) : null}

      <fieldset className="space-y-4">
        <legend className="w-full">
          {showStem ? (
            <span lang="en" dir="ltr" className="mb-2 block text-base text-ink-muted">
              {PHQ_GAD_STEM_EN}
            </span>
          ) : null}
          <h1 ref={heading} tabIndex={-1} lang="en" dir="ltr" className="block text-xl font-semibold leading-relaxed outline-none sm:text-2xl">
            {item.text}
          </h1>
        </legend>
        <div role="radiogroup" aria-label={t("optionsLabel")} className="space-y-3">
          {options.map((o) => {
            const isSel = selected === o.value;
            const label = o.labelEn ?? (o.value === true ? t("yes") : t("no"));
            return (
              <button
                key={String(o.value)}
                type="button"
                role="radio"
                aria-checked={isSel}
                disabled={saving}
                onClick={() => void answer(item, o.value)}
                lang={o.labelEn ? "en" : undefined}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border px-5 py-3 text-start text-lg transition-all duration-200 ${
                  isSel ? "border-primary bg-primary-soft shadow-[var(--shadow-card)]" : "border-line bg-surface hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                }`}
              >
                <span aria-hidden className={`size-5 shrink-0 rounded-full border-2 ${isSel ? "border-primary bg-primary" : "border-line-strong"}`} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      {saving ? <Spinner label={t("saving")} /> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      <p className="text-ink-muted">{t("reassure")}</p>
    </div>
  );
}
