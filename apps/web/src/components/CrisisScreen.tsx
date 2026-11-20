"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api, type Language, type Urgency } from "@/lib/api";
import { orderCrisisLines, type CrisisLineId } from "@/lib/crisis";
import { K, getToken, writeJson } from "@/lib/session";
import { GateBadge } from "./ContentBlock";
import { Icon, btn } from "./ui";

export interface CrisisEnglish {
  h1: string;
  h1b: string;
  clinician: string;
  names: Record<CrisisLineId, string>;
  desc: Record<CrisisLineId, string>;
}

type AlertStatus = "ok" | "pending" | "failed" | "nosession";

/**
 * S-06. No LLM content, ever. Numbers render with no network. Arabic crisis copy
 * is unreviewed, so the English original is shown beneath it (LOCALIZATION §4).
 */
export function CrisisScreen({
  urgency,
  source,
  alerted,
  gateMs,
  failClosed,
  english,
}: {
  urgency: Urgency;
  source: string | null;
  alerted: boolean;
  gateMs: number | null;
  failClosed: boolean;
  english: CrisisEnglish | null;
}) {
  const t = useTranslations("crisis");
  const tg = useTranslations("gates");
  const locale = useLocale() as Language;
  const router = useRouter();
  const h1 = useRef<HTMLHeadingElement>(null);
  const [copied, setCopied] = useState<CrisisLineId | null>(null);
  const needsAlert = !alerted && source === "help_button";
  const [status, setStatus] = useState<AlertStatus>(() => (alerted ? "ok" : needsAlert ? "pending" : "nosession"));
  const lines = orderCrisisLines(urgency);

  useEffect(() => {
    h1.current?.focus();
    writeJson(K.llmLocked, true);
  }, []);

  useEffect(() => {
    if (!needsAlert) return;
    let cancelled = false;
    async function raise(attempt: number): Promise<void> {
      if (!getToken()) {
        if (!cancelled) setStatus("nosession");
        return;
      }
      try {
        await api.crisisCheck({ text: "", source: "help_button", language_hint: locale });
        if (!cancelled) setStatus("ok");
      } catch {
        if (attempt < 2) return raise(attempt + 1);
        if (!cancelled) setStatus("failed");
      }
    }
    void raise(0);
    return () => {
      cancelled = true;
    };
  }, [needsAlert, locale]);

  async function copy(id: CrisisLineId, number: string) {
    try {
      await navigator.clipboard.writeText(number.replace(/\s/g, ""));
      setCopied(id);
    } catch {
      /* clipboard blocked: the tel: link still works */
    }
  }

  const statusText = {
    ok: t("alerted"),
    pending: t("connecting"),
    failed: t("alertFailed"),
    nosession: t("noSession"),
  }[status];

  return (
    <div className="space-y-5">
      {failClosed ? (
        <p className="rounded-lg border border-help/40 bg-surface px-4 py-3 text-help">{t("failClosed")}</p>
      ) : null}
      <div>
        <h1 ref={h1} tabIndex={-1} className="headline text-4xl leading-tight outline-none">
          {t("h1")}
          <br />
          {t("h1b")}
        </h1>
        {english ? (
          <p lang="en" dir="ltr" className="mt-1 text-base text-ink-muted">
            {english.h1} {english.h1b}
          </p>
        ) : null}
      </div>

      <ul className="space-y-3">
        {lines.map((line) => (
          <li key={line.id} className="flex flex-col gap-1.5 sm:flex-row sm:items-stretch sm:gap-2">
            <a
              href={line.tel}
              aria-label={t("callLabel", { name: t(`names.${line.id}`), number: line.number })}
              className="flex min-h-16 flex-1 items-center gap-3 rounded-xl bg-help px-5 py-3.5 text-on-help"
            >
              <Icon name="phone" className="size-6 shrink-0" />
              <span className="flex min-w-0 flex-col">
                <span className="text-lg font-semibold">{t(`names.${line.id}`)}</span>
                <bdi dir="ltr" className="tabular whitespace-nowrap text-2xl font-semibold">
                  {line.number}
                </bdi>
                <span className="text-sm opacity-95">{t(`desc.${line.id}`)}</span>
                {english ? (
                  <span lang="en" dir="ltr" className="text-xs opacity-90">
                    {english.names[line.id]}: {english.desc[line.id]}
                  </span>
                ) : null}
              </span>
            </a>
            <button type="button" onClick={() => copy(line.id, line.number)} className={`${btn.secondary} min-w-11 self-end px-4 text-sm sm:self-auto`}>
              {copied === line.id ? t("copied") : t("copy")}
            </button>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-line bg-surface p-5">
        <p className="text-lg font-semibold">{t("clinician")}</p>
        {english ? (
          <p lang="en" dir="ltr" className="text-sm text-ink-muted">
            {english.clinician}
          </p>
        ) : null}
        <p className="mt-2 flex items-center gap-2" role="status">
          <span aria-hidden className={`size-2.5 rounded-full ${status === "ok" ? "bg-green" : status === "failed" ? "bg-help" : "bg-line-strong"}`} />
          {statusText}
        </p>
        <p className="mt-2 text-sm text-ink-muted">{t("demoNote")}</p>
      </div>

      <p className="text-lg">{t("trust")}</p>

      <div className="flex flex-wrap items-center gap-2">
        <GateBadge tone="locked" icon="lock">
          {tg("aiLocked")}
        </GateBadge>
        <span className="text-sm text-ink-muted">{t("aiOff")}</span>
        {gateMs !== null ? <span className="font-mono text-xs text-ink-muted">{t("gateTime", { ms: gateMs })}</span> : null}
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button type="button" onClick={() => router.back()} className={btn.ghost}>
          {t("back")}
        </button>
        {failClosed ? (
          <Link href="/me/result" className={btn.secondary}>
            {t("continueResult")}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
