"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError, CONSENT_SCOPES, api, problemMessage, type ConsentScope, type ConsentSet, type Provider } from "@/lib/api";
import { useSessionJson } from "@/lib/hooks";
import { K, writeJson } from "@/lib/session";
import { Alert, Card, Icon, Spinner, btn } from "../ui";
import { ProviderCard } from "./StepView";

/** Scopes that travel with the referral packet (ReferralCreate.consent_scopes). */
const REFERRAL_SCOPES: ConsentScope[] = ["share_with_receiving_provider", "share_physical_context"];

export function BookView() {
  const t = useTranslations("book");
  const tc = useTranslations("common");
  const router = useRouter();
  const provider = useSessionJson<Provider>(K.provider);
  const episodeId = useSessionJson<string>(K.episodeId);
  const [consents, setConsents] = useState<ConsentSet | null>(null);
  const [savingScope, setSavingScope] = useState<ConsentScope | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getConsents()
      .then((c) => !cancelled && setConsents(c))
      .catch((e) => !cancelled && setError(problemMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  const granted = (scope: ConsentScope) => consents?.consents.find((c) => c.scope === scope)?.status === "granted";

  async function toggle(scope: ConsentScope, on: boolean) {
    if (!consents) return;
    setSavingScope(scope);
    setError(null);
    // Optimistic: the preview changes in the same frame (DESIGN_SYSTEM principle 6).
    const prev = consents;
    const others = consents.consents.filter((c) => c.scope !== scope);
    setConsents({ ...consents, consents: [...others, { scope, status: on ? "granted" : "revoked" }] });
    try {
      const next = await api.putConsents({ notice_version: consents.notice_version, consents: [{ scope, status: on ? "granted" : "revoked" }] });
      setConsents(next);
    } catch (e) {
      setConsents(prev);
      setError(`${t("consentFailed")} (${problemMessage(e)})`);
    } finally {
      setSavingScope(null);
    }
  }

  async function send() {
    if (!provider || !episodeId) return;
    if (!granted("share_with_receiving_provider")) {
      setError(t("consentRequired"));
      return;
    }
    setSending(true);
    setError(null);
    try {
      const ref = await api.createReferral(episodeId, {
        provider_id: provider.id,
        priority: "routine",
        requested_slot: provider.next_slot ?? null,
        consent_scopes: REFERRAL_SCOPES.filter(granted),
      });
      writeJson(K.referral(episodeId), ref.id);
      router.push("/me/plan?sent=1");
    } catch (e) {
      setSending(false);
      if (e instanceof ApiError && e.code === "CONSENT_REQUIRED") setError(t("consentRequired"));
      else setError(`${t("sendFailed")} (${problemMessage(e)})`);
    }
  }

  if (!provider || !episodeId) {
    return (
      <div className="space-y-4">
        <h1 className="headline text-3xl">{t("title")}</h1>
        <Alert>{t("noProvider")}</Alert>
        <Link href="/me/step" className={btn.primary}>{tc("back")}</Link>
      </div>
    );
  }

  const shareReferral = granted("share_with_receiving_provider");
  const sharePhysical = granted("share_physical_context");

  return (
    <div className="space-y-4">
      <h1 className="headline text-3xl">{t("title")}</h1>
      <h2 className="text-lg font-semibold">{t("chosen")}</h2>
      <ProviderCard p={provider} rank={1} />

      <Card>
        <h2 className="text-lg font-semibold">{t("consentTitle")}</h2>
        <p className="mb-3 text-ink-muted">{t("consentIntro")}</p>
        {!consents && !error ? <Spinner label={tc("loading")} /> : null}
        {consents ? (
          <ul className="divide-y divide-line">
            {CONSENT_SCOPES.map((scope) => {
              const on = granted(scope);
              const id = `consent-${scope}`;
              return (
                <li key={scope} className="flex items-start gap-3 py-3">
                  <div className="flex-1">
                    <label htmlFor={id} className="font-medium">{t(`scopes.${scope}.label`)}</label>
                    <p id={`${id}-desc`} className="text-sm text-ink-muted">{t(`scopes.${scope}.desc`)}</p>
                  </div>
                  <button
                    id={id}
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-describedby={`${id}-desc`}
                    disabled={savingScope !== null}
                    onClick={() => toggle(scope, !on)}
                    className={`relative inline-flex h-11 w-16 shrink-0 items-center rounded-full border-2 transition-colors ${on ? "border-primary bg-primary" : "border-line-strong bg-surface-muted"}`}
                  >
                    <span aria-hidden className={`absolute top-1/2 size-7 -translate-y-1/2 rounded-full bg-surface shadow transition-all ${on ? "start-[calc(100%-2rem)]" : "start-1"}`} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : null}
        {consents?.effects && consents.effects.length > 0 ? (
          <div className="mt-3 rounded-xl bg-surface-muted p-3 text-sm" aria-live="polite">
            <p className="font-medium">{t("effectsTitle")}</p>
            <ul className="list-disc ps-5">
              {consents.effects.map((e) => <li key={e}>{e}</li>)}
            </ul>
          </div>
        ) : null}
      </Card>

      <Card>
        <h2 className="mb-2 text-lg font-semibold">{t("previewTitle")}</h2>
        <ul className="space-y-1" aria-live="polite">
          {shareReferral ? <li className="flex items-center gap-2"><Icon name="check" />{t("previewReferral")}</li> : null}
          {shareReferral && sharePhysical ? <li className="flex items-center gap-2"><Icon name="check" />{t("previewPhysical")}</li> : null}
          {!shareReferral ? <li>{t("previewNothing")}</li> : null}
        </ul>
        <p className="mt-3 font-medium">{t("employer")}</p>
        <p className="text-sm text-ink-muted">{t("insurer")}</p>
      </Card>

      {error ? <Alert tone="error">{error}</Alert> : null}
      <button type="button" onClick={send} disabled={sending || !consents} className={`${btn.primary} w-full`}>
        {sending ? t("sending") : t("send")}
      </button>
    </div>
  );
}
