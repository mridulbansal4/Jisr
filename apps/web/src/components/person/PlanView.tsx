"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api, problemMessage, type Episode } from "@/lib/api";
import { useMyEpisodeId } from "@/lib/useMyEpisode";
import { ContentBlock } from "../ContentBlock";
import { Timeline } from "../Timeline";
import { TrajectoryChart } from "../charts/TrajectoryChart";
import { Alert, Icon, Spinner, btn } from "../ui";

export function PlanView({ justSent }: { justSent: boolean }) {
  const t = useTranslations("plan");
  const ts = useTranslations("states");
  const tstep = useTranslations("step");
  const tc = useTranslations("common");
  const tb = useTranslations("book");
  const tt = useTranslations("trajectory");
  const format = useFormatter();
  const episodeId = useMyEpisodeId();
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!episodeId) return;
    let cancelled = false;
    const load = () =>
      api
        .getEpisode(episodeId)
        .then(({ episode: ep }) => {
          if (cancelled) return;
          setEpisode(ep);
          setError(null);
        })
        .catch((e) => !cancelled && setError(problemMessage(e)));
    void load();
    // Poll so provider/staff actions appear without a reload (FRONTEND §3).
    const id = setInterval(load, 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [episodeId]);

  if (episodeId === undefined) return <Spinner label={tc("loading")} />;
  if (!episodeId) {
    return (
      <div className="space-y-4">
        <h1 className="display text-4xl">{t("title")}</h1>
        <Alert>{t("noEpisode")}</Alert>
        <Link href="/me" className={btn.primary}>{t("startAgain")}</Link>
      </div>
    );
  }

  const stepIdx = episode?.current_step ? ["L0", "L1", "L2", "L3", "L4"].indexOf(episode.current_step) : -1;

  return (
    <div className="space-y-5">
      <h1 className="display text-4xl sm:text-5xl">{t("title")}</h1>
      {justSent ? <Alert tone="success">{t("sent")}</Alert> : null}
      {error ? <Alert tone="error">{`${t("loadFailed")} (${error})`}</Alert> : null}
      {!episode && !error ? <div className="skeleton h-40" /> : null}
      {episode ? (
        <>
          <ContentBlock type="calculated" title={t("now")}>
            <p className="text-2xl font-semibold tracking-tight">{ts(episode.state)}</p>
            {episode.current_step ? (
              <div className="mt-3">
                <p>
                  {t("step")}: <strong>{tstep(`names.${episode.current_step}`)}</strong> <span className="text-ink-muted">({episode.current_step})</span>
                </p>
                {stepIdx >= 0 ? (
                  <div aria-hidden className="mt-3 flex gap-1.5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? "bg-primary" : "bg-surface-muted"}`} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {episode.next_deadline ? (
              <p className="mt-3 flex items-center gap-2 text-ink-muted">
                <Icon name="clock" />
                {t("deadline", {
                  kind: t(`deadlineKinds.${episode.next_deadline.kind}`),
                  date: format.dateTime(new Date(episode.next_deadline.due_at), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
                })}
              </p>
            ) : null}
            <p className="mt-4 flex items-center gap-2 text-sm font-medium">
              <Icon name="shield" />
              {tb("employer")}
            </p>
          </ContentBlock>
          <ContentBlock type="calculated" title={tt("title")}>
            <TrajectoryChart episodeId={episode.id} />
          </ContentBlock>
          <ContentBlock type="observed" title={t("timeline")}>
            <Timeline events={episode.timeline} />
            <p className="mt-3 text-sm text-ink-muted">{t("refreshing")}</p>
          </ContentBlock>
        </>
      ) : null}
    </div>
  );
}
