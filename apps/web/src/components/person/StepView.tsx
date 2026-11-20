"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, problemMessage, type Episode, type Provider, type StepRecommendation } from "@/lib/api";
import { useSessionJson } from "@/lib/hooks";
import { K, writeJson } from "@/lib/session";
import { ContentBlock, GateBadge } from "../ContentBlock";
import { Alert, Spinner, btn } from "../ui";

export function FactorTable({ rec }: { rec: StepRecommendation }) {
  const t = useTranslations("step");
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[28rem] text-start text-sm">
        <caption className="sr-only">{t("why")}</caption>
        <thead>
          <tr className="border-b border-line text-ink-muted">
            <th scope="col" className="py-2 pe-3 text-start font-medium">{t("factorCol")}</th>
            <th scope="col" className="py-2 pe-3 text-start font-medium">{t("valueCol")}</th>
            <th scope="col" className="py-2 pe-3 text-start font-medium">{t("effectCol")}</th>
            <th scope="col" className="py-2 text-start font-medium">{t("ruleCol")}</th>
          </tr>
        </thead>
        <tbody>
          {rec.factors.map((f, i) => (
            <tr key={`${f.factor}-${i}`} className="border-b border-line align-top">
              <th scope="row" className="py-2 pe-3 text-start font-medium">
                {t.has(`factors.${f.factor}` as never) ? t(`factors.${f.factor}` as never) : f.factor}
              </th>
              <td className="py-2 pe-3">{f.value}</td>
              <td className="py-2 pe-3">{f.effect}</td>
              <td className="py-2 font-mono text-xs">
                <bdi dir="ltr">{f.rule_id}</bdi>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ProviderCard({ p, rank, onChoose }: { p: Provider; rank: number; onChoose?: () => void }) {
  const t = useTranslations("step");
  const format = useFormatter();
  return (
    <article className="card lift p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="label-quiet text-ink">{t("rank", { n: rank })}</span>
        {p.is_synthetic ? <span className="label-quiet">{t("synthetic")}</span> : null}
      </div>
      <h3 className="mt-1 text-lg font-semibold">
        <bdi>{p.display_name}</bdi>
      </h3>
      <p className="text-ink-muted">{t(`kinds.${p.kind}`)}</p>
      <ul className="mt-2 space-y-0.5 text-sm">
        <li>
          {t("languages")}: {p.languages.map((l) => l.toUpperCase()).join(" · ")}
          {p.clinician_gender ? ` · ${t(`gender.${p.clinician_gender}`)}` : ""}
        </li>
        <li>{p.modalities.map((m) => t(`modality.${m}`)).join(" · ")}</li>
        <li>
          {t("networks")}: {p.networks.join(" · ")}
        </li>
        {p.next_slot ? (
          <li className="font-medium">
            {t("nextSlot", { date: format.dateTime(new Date(p.next_slot), { weekday: "long", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) })}
          </li>
        ) : p.current_wait_days !== undefined ? (
          <li>{t("wait", { days: p.current_wait_days })}</li>
        ) : null}
        {!p.accepting ? <li className="text-ink-muted">{t("notAccepting")}</li> : null}
      </ul>
      {onChoose ? (
        <button type="button" onClick={onChoose} disabled={!p.accepting} className={`${btn.primary} mt-3 w-full`}>
          {t("choose")}
        </button>
      ) : null}
    </article>
  );
}

export function StepView() {
  const t = useTranslations("step");
  const tg = useTranslations("gates");
  const tc = useTranslations("common");
  const router = useRouter();
  const episodeId = useSessionJson<string>(K.episodeId);
  const [rec, setRec] = useState<StepRecommendation | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!episodeId) return;
    let cancelled = false;
    Promise.all([api.getEpisode(episodeId), api.getRecommendation(episodeId)])
      .then(([e, r]) => {
        if (cancelled) return;
        setEpisode(e.episode);
        setRec(r);
        setError(null);
      })
      .catch((e) => !cancelled && setError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, [episodeId, attempt]);

  if (!episodeId) {
    return (
      <div className="space-y-4">
        <h1 className="display text-4xl">{t("title")}</h1>
        <Alert>{t("loadFailed")}</Alert>
        <Link href="/me" className={btn.primary}>{tc("continue")}</Link>
      </div>
    );
  }

  if (episode?.is_red) {
    return (
      <div className="space-y-4">
        <h1 className="display text-4xl">{t("title")}</h1>
        <p className="text-lg">{t("redLocked")}</p>
        <Link href="/help?alerted=1" className={btn.help}>{tc("continue")}</Link>
      </div>
    );
  }

  function choose(p: Provider) {
    writeJson(K.provider, p);
    router.push("/me/book");
  }

  return (
    <div className="space-y-4">
      <h1 className="display text-4xl">{t("title")}</h1>
      {error ? (
        <div className="space-y-2">
          <Alert tone="error">{`${t("loadFailed")} (${error})`}</Alert>
          <button type="button" className={btn.secondary} onClick={() => setAttempt((a) => a + 1)}>{tc("retry")}</button>
        </div>
      ) : null}
      {!rec && !error ? <Spinner label={tc("loading")} /> : null}
      {rec ? (
        <>
          <ContentBlock type="calculated" title={t(`names.${rec.recommended_step}`)} meta={tc("rulesVersion", { version: rec.rule_set_version })}>
            <p className="text-ink-muted">{t("level", { step: rec.recommended_step })}</p>
            <h3 className="mb-2 mt-4 font-semibold">{t("why")}</h3>
            <FactorTable rec={rec} />
          </ContentBlock>
          <div>
            {rec.status === "confirmed" ? (
              <GateBadge tone="ok" icon="check">{tg("clinicianConfirmed")}</GateBadge>
            ) : (
              <GateBadge icon="shield">{tg("clinicianPending")}</GateBadge>
            )}
          </div>
          <ContentBlock type="calculated" title={t("providersTitle")}>
            {rec.candidates.length === 0 ? <p>{t("noCandidates")}</p> : null}
            <ol className="space-y-3">
              {rec.candidates.map((p, i) => (
                <li key={p.id}>
                  <ProviderCard p={p} rank={i + 1} onChoose={() => choose(p)} />
                </li>
              ))}
            </ol>
          </ContentBlock>
        </>
      ) : null}
    </div>
  );
}
