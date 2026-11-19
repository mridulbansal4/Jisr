import { getTranslations, setRequestLocale } from "next-intl/server";
import { CrisisScreen, type CrisisEnglish } from "@/components/CrisisScreen";
import { PersonShell } from "@/components/PersonShell";
import { parseUrgency } from "@/lib/crisis";

function one(v: string | string[] | undefined): string | null {
  return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
}

export default async function HelpPage({ params, searchParams }: PageProps<"/[locale]/help">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const ms = Number(one(sp.ms));
  let english: CrisisEnglish | null = null;
  if (locale !== "en") {
    const en = await getTranslations({ locale: "en", namespace: "crisis" });
    english = {
      h1: en("h1"),
      h1b: en("h1b"),
      clinician: en("clinician"),
      names: { emergency: en("names.emergency"), sakina: en("names.sakina"), hope: en("names.hope") },
      desc: { emergency: en("desc.emergency"), sakina: en("desc.sakina"), hope: en("desc.hope") },
    };
  }
  const t = await getTranslations("crisis");
  return (
    <PersonShell title={t("h1")}>
      <CrisisScreen
        urgency={parseUrgency(one(sp.urgency))}
        source={one(sp.src)}
        alerted={one(sp.alerted) === "1"}
        gateMs={Number.isFinite(ms) && one(sp.ms) !== null ? ms : null}
        failClosed={one(sp.failclosed) === "1"}
        english={english}
      />
    </PersonShell>
  );
}
