"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ApiError,
  STEPS,
  api,
  findReferralId,
  problemMessage,
  type ContactChannel,
  type ContactOutcome,
  type CrisisResolution,
  type Episode,
  type RedAckCategory,
  type Step,
  type StepRecommendation,
} from "@/lib/api";
import { useAuth, useSessionJson } from "@/lib/hooks";
import { K } from "@/lib/session";
import { ContentBlock, GateBadge } from "../ContentBlock";
import { ScoreBar } from "../person/ResultView";
import { FactorTable } from "../person/StepView";
import { Timeline } from "../Timeline";
import { Alert, Card, Icon, Spinner, btn, input } from "../ui";
import { SlaCountdown, SlaRing } from "./SlaCountdown";
import { HandoffSummary } from "./HandoffSummary";
import { TrajectoryChart } from "../charts/TrajectoryChart";

const ACK: RedAckCategory[] = ["calling_now", "crisis_line_transfer", "emergency_services_called", "other"];
const CHANNELS: ContactChannel[] = ["phone", "video", "sms", "whatsapp", "in_person", "crisis_line_transfer"];
const OUTCOMES: ContactOutcome[] = ["reached_safe", "reached_needs_emergency", "no_answer", "wrong_number", "declined_contact", "voicemail_neutral"];
const RESOLUTIONS: CrisisResolution[] = ["contacted_safe", "emergency_services", "referred_l4", "unreachable_escalated"];

type Flash = { tone: "success" | "error"; text: string } | null;

function ActionCard({ title, children, tone }: { title: string; children: ReactNode; tone?: "red" }) {
  return (
    <Card className={`p-5 ${tone === "red" ? "border-red/50" : ""}`}>
      <h2 className="mb-3 text-base font-semibold tracking-tight">{title}</h2>
      {children}
    </Card>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: ReactNode }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}

export function EpisodeConsole({ episodeId, label }: { episodeId: string; label: string | null }) {
  const t = useTranslations("staff");
  const te = useTranslations("staff.episode");
  const ts = useTranslations("states");
  const tstep = useTranslations("step");
  const tc = useTranslations("common");
  const tt = useTranslations("trajectory");
  const format = useFormatter();
  const auth = useAuth();
  const isClinician = auth?.role === "clinician";
  const storedReferral = useSessionJson<string>(K.referral(episodeId));

  const [episode, setEpisode] = useState<Episode | null>(null);
  const [etag, setEtag] = useState<string>("");
  const [rec, setRec] = useState<StepRecommendation | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const [ackCat, setAckCat] = useState<RedAckCategory>("calling_now");
  const [channel, setChannel] = useState<ContactChannel>("phone");
  const [outcome, setOutcome] = useState<ContactOutcome>("reached_safe");
  const [step, setStep] = useState<Step | "">("");
  const [reason, setReason] = useState("");
  const [resolveCrisis, setResolveCrisis] = useState(false);
  const [resolution, setResolution] = useState<CrisisResolution>("contacted_safe");
  const [closeReason, setCloseReason] = useState("");

  const load = useCallback(
    () =>
      Promise.all([
        api.getEpisode(episodeId).then(
          ({ episode: ep, etag: tag }) => {
            setEpisode(ep);
            setEtag(tag);
            setLoadError(null);
          },
          (e: unknown) => setLoadError(problemMessage(e)),
        ),
        api.getRecommendation(episodeId).then(setRec, () => setRec(null)),
      ]),
    [episodeId],
  );

  useEffect(() => {
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => clearInterval(id);
  }, [load]);

  async function act(name: string, fn: () => Promise<string>) {
    setBusy(name);
    setFlash(null);
    try {
      const text = await fn();
      setFlash({ tone: "success", text });
    } catch (e) {
      if (e instanceof ApiError && e.code === "CONFLICT_STALE") setFlash({ tone: "error", text: t("confirm.stale") });
      else setFlash({ tone: "error", text: `${t("actionFailed")}: ${problemMessage(e)}` });
    } finally {
      setBusy(null);
      void load();
    }
  }

  const referralId = (episode ? findReferralId(episode, storedReferral) : storedReferral) ?? "";
  const activeReferral = episode?.referrals?.find((r) => r.id === referralId) ?? null;
  const effectiveStep: Step | "" = step || rec?.recommended_step || episode?.current_step || "";
  const crisisDeadline = episode?.next_deadline?.kind === "crisis_ack" ? episode.next_deadline : null;
  const fmt = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" });

  if (!episode) {
    return loadError ? (
      <div className="space-y-3">
        <Alert tone="error">{`${te("loadFailed")} (${loadError})`}</Alert>
        <Link href="/staff" className={btn.secondary}>{te("back")}</Link>
      </div>
    ) : (
      <Spinner label={tc("loading")} />
    );
  }

  return (
    <div className="space-y-5">
      {/* ---------------- header ---------------- */}
      <div className={`card flex flex-wrap items-center gap-4 p-5 ${episode.is_red ? "border-red/40" : ""}`}>
        <Link href="/staff" className={`${btn.ghost} px-2`}>
          <span aria-hidden className="rtl:rotate-180">‹</span> {te("back")}
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="flex flex-wrap items-center gap-x-3 gap-y-1 font-display text-3xl">
            {episode.is_red ? <span className="rounded-full bg-help px-2.5 py-0.5 text-sm text-on-help">{t("red")}</span> : null}
            <bdi>{label ?? episode.person_label ?? te("title")}</bdi>
            {episode.language ? <span className="label-quiet">{episode.language.toUpperCase()}</span> : null}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {ts(episode.state)} · {te("currentStep", { step: episode.current_step ?? "n/a" })}
            {episode.owner?.team ? ` · ${te("owner", { owner: episode.owner.team })}` : ""}
            {episode.red_severity ? ` · ${episode.red_severity}` : ""}
            <span className="ms-2 font-mono text-xs">
              <bdi dir="ltr">#{episode.last_event_seq}</bdi>
            </span>
          </p>
        </div>
        {crisisDeadline ? (
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-red">{te("slaClock")}</span>
            <SlaRing deadline={crisisDeadline} size={76} />
          </div>
        ) : episode.next_deadline ? (
          <SlaCountdown deadline={episode.next_deadline} />
        ) : null}
      </div>
      <div aria-live="polite">{flash ? <Alert tone={flash.tone}>{flash.text}</Alert> : null}</div>
      {loadError ? <Alert tone="warn">{loadError}</Alert> : null}

      {/* ---------------- AI hand-off with provenance ---------------- */}
      <HandoffSummary episodeId={episode.id} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_22rem]">
        {/* ---------------- column 1: summary ---------------- */}
        <div className="space-y-5">
          <ContentBlock type="calculated" title={te("scores")}>
            <div className="space-y-4">
              {(episode.scores ?? []).map((s) => (
                <div key={s.instrument}>
                  <ScoreBar score={s} />
                  {s.item9 !== undefined && s.item9 !== null ? (
                    <p className={`mt-1 text-sm ${s.item9 > 0 ? "font-semibold text-red" : "text-ink-muted"}`}>PHQ-9 item 9: {s.item9}</p>
                  ) : null}
                </div>
              ))}
              {(episode.scores ?? []).length === 0 ? <p className="text-ink-muted">n/a</p> : null}
            </div>
          </ContentBlock>

          <ContentBlock type="observed" title={te("physical")}>
            {episode.physical_context ? (
              <dl className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-surface-muted p-3">
                  <dt className="text-sm text-ink-muted">{te("hba1c")}</dt>
                  <dd className="text-lg font-semibold tabular">{episode.physical_context.hba1c_pct ?? "n/a"}%</dd>
                </div>
                <div className="rounded-lg bg-surface-muted p-3">
                  <dt className="text-sm text-ink-muted">{te("bmi")}</dt>
                  <dd className="text-lg font-semibold tabular">{episode.physical_context.bmi ?? "n/a"}</dd>
                </div>
                <div className="rounded-lg bg-surface-muted p-3">
                  <dt className="text-sm text-ink-muted">{te("bp")}</dt>
                  <dd className="text-lg font-semibold tabular">
                    <bdi dir="ltr">
                      {episode.physical_context.bp_systolic ?? "n/a"}/{episode.physical_context.bp_diastolic ?? "n/a"}
                    </bdi>
                  </dd>
                </div>
                {episode.physical_context.observed_at ? (
                  <p className="col-span-3 text-sm text-ink-muted">{te("observedAt", { date: fmt(episode.physical_context.observed_at) })}</p>
                ) : null}
              </dl>
            ) : (
              <p className="text-ink-muted">{te("physicalNone")}</p>
            )}
          </ContentBlock>

          <ContentBlock type="calculated" title={te("factors")} meta={rec ? tc("rulesVersion", { version: rec.rule_set_version }) : undefined}>
            {rec ? (
              <>
                <p className="mb-2 font-medium">
                  {te("recommended", { step: `${rec.recommended_step} · ${tstep(`names.${rec.recommended_step}`)}` })}{" "}
                  <span className="text-sm text-ink-muted">({rec.status})</span>
                </p>
                <FactorTable rec={rec} />
              </>
            ) : (
              <p className="text-ink-muted">{te("noRec")}</p>
            )}
            {episode.fired_rules && episode.fired_rules.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {episode.fired_rules.map((r) => (
                  <span key={r} className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-xs">
                    <bdi dir="ltr">{r}</bdi>
                  </span>
                ))}
              </div>
            ) : null}
          </ContentBlock>
        </div>

        {/* ---------------- column 2: trajectory + timeline ---------------- */}
        <div className="space-y-5">
          <ContentBlock type="calculated" title={tt("title")}>
            <TrajectoryChart episodeId={episode.id} compact />
          </ContentBlock>
          <ContentBlock type="observed" title={te("timeline")}>
            <Timeline events={episode.timeline} showType />
          </ContentBlock>
        </div>

        {/* ---------------- column 3: actions ---------------- */}
        <div className="space-y-5 lg:col-span-2 xl:col-span-1">
          {episode.is_red ? (
            <ActionCard title={t("ack.title")} tone="red">
              <Field label={t("ack.category")} id="ack-cat">
                <select id="ack-cat" className={input} value={ackCat} onChange={(e) => setAckCat(e.target.value as RedAckCategory)}>
                  {ACK.map((a) => (
                    <option key={a} value={a}>{t(`ack.categories.${a}`)}</option>
                  ))}
                </select>
              </Field>
              <button
                type="button"
                className={`${btn.danger} w-full`}
                disabled={busy !== null}
                onClick={() =>
                  act("ack", async () => {
                    const r = await api.ackRed(episode.id, ackCat);
                    return t("ack.done", { time: fmt(r.acknowledged_at), sla: r.within_sla ? t("ack.within") : t("ack.outside") });
                  })
                }
              >
                {t("ack.submit")}
              </button>
            </ActionCard>
          ) : null}

          <ActionCard title={t("confirm.title")}>
            {!isClinician ? <p className="mb-2 text-sm text-ink-muted">{t("confirm.clinicianOnly")}</p> : null}
            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                const recId = rec?.id ?? episode.recommendation_id;
                if (!recId || !effectiveStep) return;
                void act("confirm", async () => {
                  const r = await api.confirmStep(episode.id, etag, {
                    recommendation_id: recId,
                    step: effectiveStep,
                    reason: reason.trim() || null,
                    resolve_crisis: episode.is_red ? resolveCrisis : false,
                    crisis_resolution: episode.is_red && resolveCrisis ? resolution : null,
                  });
                  return t("confirm.done", { step: r.current_step, status: r.recommendation_status });
                });
              }}
            >
              <Field label={t("confirm.step")} id="cf-step">
                <select id="cf-step" className={input} value={effectiveStep} disabled={!isClinician} onChange={(e) => setStep(e.target.value as Step)}>
                  {STEPS.map((s) => (
                    <option key={s} value={s}>
                      {s} · {tstep(`names.${s}`)}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t("confirm.reason")} id="cf-reason">
                <textarea id="cf-reason" rows={2} maxLength={500} className={input} disabled={!isClinician} value={reason} onChange={(e) => setReason(e.target.value)} />
              </Field>
              {episode.is_red ? (
                <>
                  <label className="mb-3 flex min-h-11 items-center gap-2 text-sm">
                    <input type="checkbox" className="size-5" disabled={!isClinician} checked={resolveCrisis} onChange={(e) => setResolveCrisis(e.target.checked)} />
                    {t("confirm.resolveCrisis")}
                  </label>
                  {resolveCrisis ? (
                    <Field label={t("confirm.resolution")} id="cf-res">
                      <select id="cf-res" className={input} value={resolution} onChange={(e) => setResolution(e.target.value as CrisisResolution)}>
                        {RESOLUTIONS.map((r) => (
                          <option key={r} value={r}>{t(`confirm.resolutions.${r}`)}</option>
                        ))}
                      </select>
                    </Field>
                  ) : null}
                </>
              ) : null}
              <button type="submit" className={`${btn.primary} w-full`} disabled={!isClinician || !(rec?.id ?? episode.recommendation_id) || busy !== null}>
                <Icon name="check" />
                {t("confirm.submit")}
              </button>
              <div className="mt-2">
                <GateBadge icon="shield">{tc("rulesVersion", { version: rec?.rule_set_version ?? "n/a" })}</GateBadge>
              </div>
            </form>
          </ActionCard>

          <ActionCard title={t("contact.title")}>
            <Field label={t("contact.channel")} id="c-channel">
              <select id="c-channel" className={input} value={channel} onChange={(e) => setChannel(e.target.value as ContactChannel)}>
                {CHANNELS.map((c) => (
                  <option key={c} value={c}>{t(`contact.channels.${c}`)}</option>
                ))}
              </select>
            </Field>
            <Field label={t("contact.outcome")} id="c-outcome">
              <select id="c-outcome" className={input} value={outcome} onChange={(e) => setOutcome(e.target.value as ContactOutcome)}>
                {OUTCOMES.map((o) => (
                  <option key={o} value={o}>{t(`contact.outcomes.${o}`)}</option>
                ))}
              </select>
            </Field>
            <button
              type="button"
              className={`${btn.secondary} w-full`}
              disabled={busy !== null}
              onClick={() =>
                act("contact", async () => {
                  const r = await api.logContactAttempt(episode.id, { channel, outcome, note: null, next_attempt_at: null });
                  const base = t("contact.done", { n: r.attempt_number });
                  return r.escalation?.to ? `${base} ${t("contact.escalated", { to: r.escalation.to })}` : base;
                })
              }
            >
              {t("contact.submit")}
            </button>
          </ActionCard>

          <ActionCard title={t("simulate.title")}>
            <p className="mb-2 text-sm text-ink-muted">{t("simulate.note")}</p>
            {referralId ? (
              <p className="mb-3 rounded-lg bg-surface-muted px-3 py-2 text-sm">
                {t("simulate.referral")}: <strong>{activeReferral?.provider_name ?? "n/a"}</strong>
                {activeReferral?.status ? <span className="text-ink-muted"> · {activeReferral.status}</span> : null}
                <span className="block truncate font-mono text-[11px] text-ink-faint">
                  <bdi dir="ltr">{referralId}</bdi>
                </span>
              </p>
            ) : (
              <p className="mb-2 text-sm text-ink-muted">{t("simulate.noReferral")}</p>
            )}
            <div className="grid gap-2">
              <button
                type="button"
                className={btn.secondary}
                disabled={!referralId || busy !== null}
                onClick={() =>
                  act("accept", async () => {
                    const r = await api.decideReferral(referralId, { decision: "accept", on_behalf_of_provider: true });
                    return t("simulate.accepted", { status: r.status, state: ts(r.episode_state) });
                  })
                }
              >
                {t("simulate.accept")}
              </button>
              <button
                type="button"
                className={btn.secondary}
                disabled={!referralId || busy !== null}
                onClick={() =>
                  act("decline", async () => {
                    const r = await api.decideReferral(referralId, { decision: "decline", reason: "no_capacity", on_behalf_of_provider: true });
                    return t("simulate.accepted", { status: r.status, state: ts(r.episode_state) });
                  })
                }
              >
                {t("simulate.decline")}
              </button>
              <button
                type="button"
                className={btn.secondary}
                disabled={!referralId || busy !== null}
                onClick={() =>
                  act("book", async () => {
                    const start = new Date(Date.now() + 2 * 24 * 3600 * 1000);
                    start.setUTCHours(12, 30, 0, 0); // 16:30 Asia/Dubai
                    const r = await api.referralAppointment(referralId, { action: "book", start_at: start.toISOString(), modality: "video" });
                    return t("simulate.booked", { status: r.status, state: ts(r.episode_state) });
                  })
                }
              >
                {t("simulate.book")}
              </button>
            </div>
          </ActionCard>

          {isClinician ? (
            <ActionCard title={t("close.title")}>
              <Field label={t("close.reason")} id="close-reason">
                <textarea id="close-reason" rows={2} maxLength={500} className={input} value={closeReason} onChange={(e) => setCloseReason(e.target.value)} />
              </Field>
              <button
                type="button"
                className={`${btn.secondary} w-full`}
                disabled={busy !== null || !closeReason.trim()}
                onClick={() =>
                  act("close", async () => {
                    const r = await api.closeEpisode(episode.id, { basis: "clinician_decision", reason: closeReason.trim() });
                    return t("close.done", { reason: r.close_reason });
                  })
                }
              >
                {t("close.submit")}
              </button>
            </ActionCard>
          ) : null}
        </div>
      </div>
    </div>
  );
}
