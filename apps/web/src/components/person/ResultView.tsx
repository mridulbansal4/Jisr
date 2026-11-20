"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  ApiError,
  api,
  problemMessage,
  type Episode,
  type Explanation,
  type Language,
  type Score,
  type ScreeningCompleteResult,
} from "@/lib/api";
import { useSessionJson } from "@/lib/hooks";
import { K, writeJson } from "@/lib/session";
import { ContentBlock, GateBadge } from "../ContentBlock";
import { Alert, Spinner, btn } from "../ui";
import type { StoredAnswers } from "./ScreeningFlow";

const MAX: Record<string, number> = { PHQ9: 27, GAD7: 21, PHQ2: 6, GAD2: 6, CSSRS_SCREEN: 6 };

type ExplainState =
  | { kind: "loading" }
  | { kind: "ok"; data: Explanation }
  | { kind: "locked" }
  | { kind: "unavailable"; detail?: string }
  | { kind: "none" };

export function ScoreBar({ score }: { score: Score }) {
  const t = useTranslations("result");
  const ti = useTranslations("instruments");
  const tb = useTranslations("bands");
  const max = MAX[score.instrument] ?? 27;
  const pct = Math.min(100, Math.round((score.total / max) * 100));
  const band = tb.has(score.band as never) ? tb(score.band as never) : score.band;
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{ti.has(score.instrument as never) ? ti(score.instrument as never) : score.instrument}</span>
        <span className="tabular text-lg font-semibold">
          <bdi dir="ltr">{t("scoreOf", { total: score.total, max })}</bdi> · {band}
        </span>
      </div>
      {/* Neutral band chart: no red/amber/green on a person's own scores (DESIGN_SYSTEM §1). */}
      <div
        role="img"
        aria-label={`${score.instrument} ${score.total}/${max} ${band}`}
        className="h-2 w-full overflow-hidden rounded-full bg-surface-muted"
      >
        <div className="h-full rounded-full bg-calc" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function ResultView() {
  const t = useTranslations("result");
  const tg = useTranslations("gates");
  const tc = useTranslations("common");
  const locale = useLocale() as Language;
  const router = useRouter();
  const completion = useSessionJson<ScreeningCompleteResult>(K.completion);
  const answers = useSessionJson<StoredAnswers>(K.answers);
  const sessionLocked = useSessionJson<boolean>(K.llmLocked) === true;
  const episodeId = completion?.episode?.id ?? null;
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [explain, setExplain] = useState<ExplainState>({ kind: "loading" });
  const [showAnswers, setShowAnswers] = useState(false);
  const [supportBusy, setSupportBusy] = useState(false);

  const locked = Boolean(completion?.crisis || completion?.llm_locked || episode?.is_red || sessionLocked);

  useEffect(() => {
    if (!episodeId) return;
    let cancelled = false;
    api
      .getEpisode(episodeId)
      .then(({ episode: ep }) => {
        if (cancelled) return;
        setEpisode(ep);
        if (ep.is_red) writeJson(K.llmLocked, true);
      })
      .catch((e) => !cancelled && setLoadError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [episodeId]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!episodeId) return setExplain({ kind: "none" });
      if (locked) return setExplain({ kind: "locked" });
      try {
        const data = await api.explain({ episode_id: episodeId, kind: "result", language: locale });
        if (!cancelled) setExplain({ kind: "ok", data });
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 423) {
          writeJson(K.llmLocked, true);
          setExplain({ kind: "locked" });
        } else setExplain({ kind: "unavailable", detail: problemMessage(e) });
      }
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [episodeId, locked, locale]);

  if (!completion) {
    return (
      <div className="space-y-4">
        <h1 className="display text-4xl">{t("title")}</h1>
        <Alert>{t("noResult")}</Alert>
        <Link href="/me" className={btn.primary}>
          {tc("continue")}
        </Link>
      </div>
    );
  }

  const scores = (episode?.scores?.length ? episode.scores : completion.scores) ?? [];
  const exp = explain.kind === "ok" ? explain.data : null;
  const aiOk = exp && exp.content_type === "ai_drafted" && !exp.fallback_used && exp.validator.result !== "fail";
  const serverTemplate = exp && !aiOk ? exp.sections : null;
  const aiBlocked = exp && exp.content_type === "ai_drafted" && (exp.fallback_used || exp.validator.result === "fail");
  const counts = answers?.items.reduce<Record<string, number>>((acc, i) => ({ ...acc, [i.instrument]: (acc[i.instrument] ?? 0) + 1 }), {}) ?? {};

  async function requestSupport() {
    if (!completion) return;
    setSupportBusy(true);
    try {
      const done = await api.completeScreening(completion.session_id, true);
      writeJson(K.completion, done);
      if (done.episode?.id) {
        writeJson(K.episodeId, done.episode.id);
        router.push("/me/step");
      }
    } catch (e) {
      setLoadError(problemMessage(e));
    } finally {
      setSupportBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-4xl">{t("title")}</h1>
      <div className="flex flex-wrap gap-2">
        {locked ? (
          <GateBadge tone="locked" icon="lock">
            {tg("crisisFired")}
          </GateBadge>
        ) : (
          <GateBadge tone="ok" icon="check">
            {tg("crisisClear")}
          </GateBadge>
        )}
      </div>
      {locked ? (
        <Link href="/help?alerted=1" className="flex min-h-11 items-center rounded-lg border border-help/40 bg-surface px-4 font-medium text-help">
          {t("redBanner")}
        </Link>
      ) : null}
      {loadError ? <Alert tone="error">{`${t("loadFailed")} (${loadError})`}</Alert> : null}

      {/* OBSERVED: what the person answered */}
      <ContentBlock type="observed" title={t("observedTitle")}>
        <p>{t("observedSummary", { count: answers?.items.length ?? 0 })}</p>
        {Object.keys(counts).length > 0 ? (
          <p className="text-sm text-ink-muted">
            {Object.entries(counts)
              .map(([k, n]) => `${k} × ${n}`)
              .join(" · ")}
          </p>
        ) : null}
        {answers?.noteGiven ? <p className="mt-1 text-sm">{t("noteGiven")}</p> : null}
        {answers && answers.items.length > 0 ? (
          <>
            <button type="button" className={`${btn.ghost} mt-1 px-0`} aria-expanded={showAnswers} onClick={() => setShowAnswers((v) => !v)}>
              {showAnswers ? t("hideAnswers") : t("viewAnswers")}
            </button>
            {showAnswers ? (
              <ol className="mt-2 space-y-2 text-sm" lang="en" dir="ltr">
                {answers.items.map((i) => (
                  <li key={i.link_id} className="flex justify-between gap-3 border-b border-line pb-2">
                    <span>{i.text}</span>
                    <span className="tabular font-semibold">{String(i.value)}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </>
        ) : null}
      </ContentBlock>

      {/* CALCULATED: deterministic scores */}
      <ContentBlock type="calculated" title={t("calcTitle")} meta={answers?.rulesVersion ? tc("rulesVersion", { version: answers.rulesVersion }) : undefined}>
        <div className="space-y-4">
          {scores.map((s) => (
            <ScoreBar key={s.instrument} score={s} />
          ))}
        </div>
        {!episodeId && !completion.positive ? <p className="mt-4">{t("belowThreshold")}</p> : null}
      </ContentBlock>

      {/* STANDARD EXPLANATION: fixed, reviewed template copy (rendered as Calculated per DESIGN_SYSTEM §2.3) */}
      <ContentBlock type="standard">
        <h3 className="font-semibold">{t("means")}</h3>
        <p className="mb-3">{serverTemplate?.what_this_means ?? t("tplMeans")}</p>
        <h3 className="font-semibold">{t("doesnt")}</h3>
        <p className="mb-3">{serverTemplate?.what_it_does_not_mean ?? t("tplDoesnt")}</p>
        {episodeId && !locked ? (
          <>
            <h3 className="font-semibold">{t("nextStepHeading")}</h3>
            <p>{serverTemplate?.next_step ?? t("tplNext")}</p>
          </>
        ) : null}
      </ContentBlock>

      {/* AI-DRAFTED: only validated text; locked on RED */}
      {episodeId ? (
        <ContentBlock type="ai" title={t("aiTitle")}>
          {explain.kind === "loading" ? <Spinner label={t("aiLoading")} /> : null}
          {explain.kind === "locked" ? (
            <div className="flex flex-wrap items-center gap-2">
              <GateBadge tone="locked" icon="lock">
                {tg("aiLocked")}
              </GateBadge>
              <span>{t("aiLocked")}</span>
            </div>
          ) : null}
          {explain.kind === "unavailable" ? (
            <div className="space-y-1">
              <GateBadge>{tg("standardExplanation")}</GateBadge>
              <p className="text-sm text-ink-muted">{t("aiUnavailable")}</p>
            </div>
          ) : null}
          {exp && aiOk ? (
            <div className="space-y-3">
              <p>{exp.sections.what_this_means}</p>
              <p>{exp.sections.what_it_does_not_mean}</p>
              <p>{exp.sections.next_step}</p>
              <div className="flex flex-wrap items-center gap-2">
                <GateBadge tone="ok" icon="check">
                  {tg("validatorPassed")}
                </GateBadge>
                <span className="font-mono text-xs text-ink-muted">{exp.provider}</span>
              </div>
              <details className="text-sm text-ink-muted">
                <summary className="min-h-11 cursor-pointer py-2">ⓘ</summary>
                {t("aiWhy")}
              </details>
            </div>
          ) : null}
          {exp && !aiOk ? (
            <div className="space-y-1">
              <GateBadge>{aiBlocked ? tg("validatorBlocked") : tg("standardExplanation")}</GateBadge>
              <p className="text-sm text-ink-muted">{t("aiUnavailable")}</p>
            </div>
          ) : null}
        </ContentBlock>
      ) : null}

      {episodeId && !locked ? (
        <Link href="/me/step" className={`${btn.primary} w-full`}>
          {t("next")}
        </Link>
      ) : null}
      {!episodeId && completion.can_request_support !== false && !locked ? (
        <button type="button" className={btn.secondary} onClick={requestSupport} disabled={supportBusy}>
          {t("requestSupport")}
        </button>
      ) : null}
    </div>
  );
}
