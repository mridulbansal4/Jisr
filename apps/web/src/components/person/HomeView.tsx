"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { clearPersonFlow } from "@/lib/session";
import { useMyEpisodeId } from "@/lib/useMyEpisode";
import { Icon, btn } from "../ui";
import { Reveal } from "../motion";

export function HomeView() {
  const t = useTranslations("home");
  const tn = useTranslations("nav");
  const tc = useTranslations("companion");
  const episodeId = useMyEpisodeId();
  return (
    <div className="space-y-6">
      <Reveal>
        <h1 className="display text-[2.5rem] sm:text-5xl">{t("title")}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink">{t("intro")}</p>
        <p className="mt-2 text-ink-muted">{t("notDx")}</p>
      </Reveal>
      <Reveal className="card p-6">
        <p className="flex items-start gap-2 font-medium">
          <Icon name="shield" className="mt-0.5 size-5 shrink-0 text-ink" />
          {t("privacy")}
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link href="/me/screen" onClick={() => clearPersonFlow()} className={`${btn.primary} sm:min-w-48`}>
            {t("start")}
            <Icon name="arrow" className="size-4 rtl:rotate-180" />
          </Link>
          {episodeId ? (
            <Link href="/me/plan" className={btn.secondary}>
              {t("myPlan")}
            </Link>
          ) : null}
        </div>
      </Reveal>
      <Reveal>
        <Link href="/me/companion" className="card lift flex items-center gap-4 p-5">
          <Icon name="chat" className="size-5 shrink-0 text-ink" />
          <span className="flex-1">
            <span className="block font-semibold">{tn("companion")}</span>
            <span className="block text-sm text-ink-muted">{tc("subtitle")}</span>
          </span>
          <Icon name="arrow" className="size-5 text-ink-faint rtl:rotate-180" />
        </Link>
      </Reveal>
    </div>
  );
}
